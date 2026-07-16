# Staging, yayın ve rollback

## Staging kurulumu

Render'da production servisinden ayrı bir Web Service oluşturun:

- Branch: `main`
- Build command: `npm ci && npm run build && cd server && npm ci && npm run migrate`
- Start command: `cd server && npm start`
- Health check: `/api/health/ready`
- Production'dan ayrı bir Neon veritabanı/branch kullanın.
- JWT, şifreleme, süper-admin ve entegrasyon sırlarını production'dan farklı tutun.
- Gerçek müşterilere e-posta/ödeme göndermemek için staging sağlayıcılarının sandbox bilgilerini kullanın.

Render servisindeki Deploy Hook değerini GitHub secret
`RENDER_STAGING_DEPLOY_HOOK`, staging adresini de `STAGING_BASE_URL`
olarak kaydedin. Ardından GitHub Actions içinden `Deploy Staging`
workflow'unu çalıştırın.

## Production yayın sırası

1. Production yedeğini alın.
2. CI testlerinin geçtiğini doğrulayın.
3. `Deploy Staging` çalıştırın.
4. Staging smoke ve tarayıcı testlerini doğrulayın.
5. Sürüm etiketi oluşturun: `git tag vX.Y.Z`.
6. Etiketi gönderin: `git push origin vX.Y.Z`.
7. `Release Artifact` workflow'unun değiştirilemez artefact ürettiğini doğrulayın.
8. Production deploy'u başlatın.
9. Production smoke testini çalıştırın.

## Rollback

- Uygulama hatasında Render'dan son sağlıklı deploy'a dönün.
- Hangi commit'e dönüleceği ilgili `vX.Y.Z` etiketiyle sabittir.
- Rollback sonrası `/api/health/ready` ve smoke testini çalıştırın.
- Migration'lar additive tutulur; veri silen migration otomatik rollback'e dahil edilmez.
- Veri bozulması varsa önce ayrı doğrulama veritabanında restore provası yapılır,
  ardından onaylanan dump production'a uygulanır.
