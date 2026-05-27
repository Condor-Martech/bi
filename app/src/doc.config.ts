import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function DocConfig(app: any) {
  const config = new DocumentBuilder()
  .setTitle('Power BI Interface API')
  .setDescription(
    [
      'Gateway multi-tenant para o Microsoft Power BI.',
      '',
      'Autentica contra o Azure AD por tenant, sincroniza workspaces e relatórios,',
      'e os serve aos usuários finais com RBAC, filtros row-level, grupos de usuários,',
      'favoritos, relatórios customizados e notificações.',
      '',
      '## Autenticação',
      'A maioria dos endpoints exige um token JWT. Faça login em `POST /users/login`,',
      'copie o `access_token` da resposta e informe-o no botão **Authorize** (esquema Bearer).',
      'O token é persistido entre recarregamentos desta página.',
      '',
      '## Papéis (RBAC)',
      '- `manager` — acesso total, incluindo sincronização do Power BI e gestão de contas.',
      '- `admin` — gestão de usuários e conteúdo.',
      '- `user` — consumo de relatórios e favoritos.',
    ].join('\n'),
  )
  .setVersion('1.1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Informe o access_token retornado por POST /users/login.',
  })
  .addServer('http://localhost:3000', 'Local')
  .addTag('Accounts', 'Credenciais de tenants Azure AD / Power BI')
  .addTag('Groups', 'Workspaces (groups) do Power BI')
  .addTag('Reports', 'Relatórios do Power BI e sincronização')
  .addTag('Users', 'Gestão de usuários e autenticação')
  .addTag('User-Groups', 'Agrupamento de usuários para permissões')
  .addTag('Custom-Reports', 'Relatórios customizados')
  .addTag('Favourites', 'Relatórios favoritos por usuário')
  .addTag('Filters', 'Filtros row-level aplicados aos relatórios')
  .addTag('Maps', 'Upload de arquivos / mapas')
  .addTag('Notifications', 'Notificações para usuários')
  .addTag('Login-Log', 'Registro de acessos / auditoria de login')
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
  customSiteTitle: 'Power BI Interface API — Docs',
  });
}