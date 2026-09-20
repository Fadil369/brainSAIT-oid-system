
-- Update SA-PHY-000001 with Gravatar, GitHub, dr.elfadil.com data
UPDATE providers SET 
  name_english = 'Dr. Mohamed El Fadil',
  name_arabic = 'د. محمد الفاضل',
  title_en = 'Founder & CEO | Physician-Technologist',
  title_ar = 'مؤسس ومدير عام | طبيب ومبتكر تقني',
  specialty = 'Clinical Informatics',
  subspecialty = 'Healthcare AI & Interoperability',
  bio_en = 'Building systems that make healthcare smarter, faster, and more human. Founder of BrainSAIT LTD — physician, entrepreneur, and healthcare AI innovator building clinical decision support and interoperability systems across the Middle East and Africa.',
  bio_ar = 'نظم ذكية تجعل الرعاية الصحية أكثر كفاءة وإنسانية. مؤسس برينسايت — طبيب ومبتكر تقني يطور أنظمة دعم القرار الطبي والتشغيل البيني عبر الشرق الأوسط وأفريقيا.',
  primary_email = 'fadil369@gmail.com',
  gravatar_email = 'fadil369@gmail.com',
  website_url = 'https://dr.elfadil.com',
  updated_at = datetime('now')
WHERE spid = 'SA-PHY-000001';

-- Verification claims
INSERT OR IGNORE INTO verification_claims (id, spid, claim_type, issuer, subject_field, status, evidence_url, issued_at, last_checked_at, created_at, updated_at, created_by_user_id) VALUES
  (hex(randomblob(8)), 'SA-PHY-000001', 'identity', 'Gravatar', 'identity', 'verified', 'https://gravatar.com/fadil369', datetime('now'), datetime('now'), datetime('now'), datetime('now'), null),
  (hex(randomblob(8)), 'SA-PHY-000001', 'identity', 'GitHub', 'identity', 'verified', 'https://github.com/fadil369', datetime('now'), datetime('now'), datetime('now'), datetime('now'), null),
  (hex(randomblob(8)), 'SA-PHY-000001', 'identity', 'BRAINSAIT', 'personal_registry', 'verified', 'https://registry.brainsait.org', datetime('now'), datetime('now'), datetime('now'), datetime('now'), null);

-- Identifiers from all sources
INSERT OR IGNORE INTO provider_identifiers (id, spid, system, value, display, verified, source, issued_at, created_at) VALUES
  (hex(randomblob(8)), 'SA-PHY-000001', 'GRAVATAR', 'fadil369', 'Gravatar: Dr.Mohamed El Fadil', 1, 'Gravatar API', datetime('now'), datetime('now')),
  (hex(randomblob(8)), 'SA-PHY-000001', 'GITHUB', 'fadil369', 'GitHub: Mohamed El Fadil MD (284 repos, 16 followers)', 1, 'GitHub API', datetime('now'), datetime('now')),
  (hex(randomblob(8)), 'SA-PHY-000001', 'YOUTUBE', 'UCVP2qmZMSTSI2fP60CfvWqg', 'YouTube: Dr.Mohamed El Fadil', 1, 'Gravatar verified', datetime('now'), datetime('now')),
  (hex(randomblob(8)), 'SA-PHY-000001', 'LINKEDIN', 'fadil369', 'LinkedIn: Dr. Mohamed El Fadil', 1, 'Gravatar verified', datetime('now'), datetime('now')),
  (hex(randomblob(8)), 'SA-PHY-000001', 'TWITTER', 'brainsait369', 'X/Twitter: @brainsait369', 1, 'Gravatar verified', datetime('now'), datetime('now')),
  (hex(randomblob(8)), 'SA-PHY-000001', 'WEBSITE', 'https://dr.elfadil.com', 'dr.elfadil.com — Official website', 1, 'Gravatar verified', datetime('now'), datetime('now'));
