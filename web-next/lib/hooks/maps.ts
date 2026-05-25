"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  mapSchema,
  mapsKeys,
  uploadResponseSchema,
  type MapItem,
} from "@/lib/api/endpoints/maps";

export function useMaps() {
  return useQuery<MapItem[]>({
    queryKey: mapsKeys.list(),
    queryFn: async () => {
      const data = await apiClient("/api/maps/all");
      return z.array(mapSchema).parse(data);
    },
  });
}

/**
 * Upload a map image. The browser sends multipart/form-data; the BFF passes
 * the body stream through to the legacy with `duplex:'half'` preserving the
 * Content-Type boundary. Returns the created map record.
 */
export function useUploadMap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      const data = await apiClient("/api/maps/upload", {
        method: "POST",
        body: formData,
      });
      return uploadResponseSchema.parse(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: mapsKeys.all }),
  });
}
