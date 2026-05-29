"use client";

import { useEffect, useRef, useState } from "react";

import type * as pbi from "powerbi-client";

import { useReportDetail } from "@/lib/hooks/reports";
import type { ReportDetail } from "@/lib/api/endpoints/reports";

import { ReportError } from "./report-error";

interface PowerBIReportProps {
  reportId: string;
  /** Optional initial data hydrated from an RSC pre-fetch. */
  initialData?: ReportDetail;
}

/**
 * Client component that mounts a live Power BI report via the vanilla
 * powerbi-client SDK.
 *
 * The legacy backend's `GET /reports/:reportId` returns BOTH the embedUrl
 * (already filtered server-side for row-level security) AND a fresh Azure
 * access_token (refreshed transparently per request via RefreshToken.refresh).
 *
 * Token refresh: react-query refetches every 55 minutes; whenever the query
 * data changes we call `report.setAccessToken(fresh)` so the embed keeps
 * working without re-rendering the iframe.
 */
export function PowerBIReport({ reportId, initialData }: PowerBIReportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<pbi.Report | null>(null);
  const serviceRef = useRef<pbi.service.Service | null>(null);
  const lastTokenRef = useRef<string | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);

  const { data, isPending, error, refetch } = useReportDetail(reportId, initialData);

  // Mount/unmount the embed when data first arrives or reportId changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !data) return;

    let cancelled = false;
    let cleanupService: pbi.service.Service | null = null;

    // Dynamic import keeps the powerbi-client module out of the SSR bundle —
    // it references `self` at module load and would crash server rendering.
    void import("powerbi-client").then((mod) => {
      if (cancelled) return;

      const service = new mod.service.Service(
        mod.factories.hpmFactory,
        mod.factories.wpmpFactory,
        mod.factories.routerFactory,
      );
      serviceRef.current = service;
      cleanupService = service;

      const config: pbi.IReportEmbedConfiguration = {
        type: "report",
        tokenType: mod.models.TokenType.Aad,
        accessToken: data.accountID.token,
        embedUrl: data.embedUrl,
        id: data.reportIdPB,
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: true,
        },
      };

      const embedded = service.embed(container, config) as pbi.Report;
      reportRef.current = embedded;
      lastTokenRef.current = data.accountID.token;

      embedded.on("error", (event) => {
        console.error("[PowerBIReport] SDK error:", event.detail);
        setEmbedError("El visor de Power BI devolvió un error.");
      });
    });

    return () => {
      cancelled = true;
      if (cleanupService) {
        try {
          cleanupService.reset(container);
        } catch {
          // container may already be detached
        }
      }
      reportRef.current = null;
      serviceRef.current = null;
      lastTokenRef.current = null;
    };
    // We only want to re-mount when the reportId changes. Token changes are
    // applied via setAccessToken in the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, Boolean(data)]);

  // Apply token refreshes without re-mounting the iframe.
  useEffect(() => {
    const report = reportRef.current;
    if (!report || !data) return;
    if (data.accountID.token === lastTokenRef.current) return;
    lastTokenRef.current = data.accountID.token;
    report.setAccessToken(data.accountID.token).catch((err) => {
      console.error("[PowerBIReport] setAccessToken failed:", err);
    });
  }, [data?.accountID.token]);

  if (isPending) {
    return (
      <div
        className="h-full animate-pulse rounded-md border border-border bg-muted/40"
        aria-busy="true"
        aria-label="Cargando reporte"
      />
    );
  }

  if (error) {
    return <ReportError message={error.message} onRetry={() => void refetch()} />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm">
      {embedError && (
        <div
          role="alert"
          className="flex items-center gap-2 border-b border-border bg-destructive/5 px-4 py-2 text-sm text-destructive"
        >
          <span className="font-medium">{embedError}</span>
        </div>
      )}
      <div ref={containerRef} className="flex-1" aria-label="Power BI report" />
      <div className="flex items-center justify-end border-t border-border bg-muted/40 px-4 py-1.5">
        <span className="font-mono text-[10px] text-muted-foreground">Powered by Plataforma BI</span>
      </div>
    </div>
  );
}
