-- Seed demo published providers + verified identity claims so the registry has live data.
INSERT OR IGNORE INTO providers (spid,oid,provider_type,name_english,name_arabic,title_en,specialty,subspecialty,bio_en,website_url,npi,orcid,gravatar_email,profile_status,verification_status,created_at,updated_at) VALUES
 ('SA-PHY-000001','1.3.6.1.4.1.61026.3.1.000001','physician','Mohamed El Fadil','محمد الفاضل','Consultant Physician','Internal Medicine','Clinical AI & Informatics','Consultant internist specialised in clinical informatics and AI-integrated diagnostics.','https://brainsait.org','1234567890','0000-0002-1234-5678','mohamed@brainsait.org','published','verified',datetime('now'),datetime('now')),
 ('SA-PHY-000002','1.3.6.1.4.1.61026.3.1.000002','physician','Dr. Sara Al-Harbi','د. سارة الحربي','Consultant Cardiologist','Cardiology','Interventional','Interventional cardiologist focused on structural heart disease and preventive cardiology.','https://brainsait.org',NULL,'0000-0001-9999-0000','sara@brainsait.org','published','verified',datetime('now'),datetime('now')),
 ('SA-PHA-000001','1.3.6.1.4.1.61026.3.1.000003','pharmacist','Lina Farouk','لينا فاروق','Clinical Pharmacist','Clinical Pharmacy','Critical Care','Critical-care and antimicrobial stewardship clinical pharmacist.','https://brainsait.org',NULL,NULL,'lina@brainsait.org','published','partial',datetime('now'),datetime('now'));

INSERT OR IGNORE INTO provider_locations (id,spid,organization_name_en,organization_name_ar,city,region,country,is_primary,created_at) VALUES
 (hex(randomblob(8)),'SA-PHY-000001','BrainSAIT Medical & Research','مركز برينسايت الطبي','Riyadh','Riyadh','SA',1,datetime('now')),
 (hex(randomblob(8)),'SA-PHY-000001','Royal Care Tower','برج العناية الملكي','Riyadh','Riyadh','SA',0,datetime('now')),
 (hex(randomblob(8)),'SA-PHY-000002','Heart & Vascular Institute','معهد القلب والأوعية الدموية','Jeddah','Makkah','SA',1,datetime('now')),
 (hex(randomblob(8)),'SA-PHA-000001','Tertiary Care Pharmacy','صيدلية الرعاية الثالثية','Riyadh','Riyadh','SA',1,datetime('now'));

INSERT OR IGNORE INTO verification_claims (id,spid,claim_type,issuer,subject_field,status,issued_at,last_checked_at,created_at,updated_at)
SELECT hex(randomblob(8)), 'SA-PHY-000001','scfhs_registration','SCFHS','registration', 'verified', datetime('now','-90 days'), datetime('now'), datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM verification_claims WHERE spid='SA-PHY-000001' AND claim_type='scfhs_registration');
