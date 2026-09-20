// FHIR R4 API endpoint — resources endpoint
// Routes: /fhir/*

import { json, badRequest, notFound, methodNotAllowed } from '../lib/http.js';

export async function handleFhir(request, env, subpath) {
  if (subpath.startsWith('/')) {
    return fhirResource(request, env, subpath);
  }
  return notFound();
}

async function fhirResource(request, env, subpath) {
  const pathParts = subpath.split('/').filter(Boolean);

  // Bundle — search all resources
  if (pathParts[0] === '$search') {
    return fhirSearch(request, env, pathParts.slice(1));
  }

  // Individual resource
  const resourceType = pathParts[0]?.toUpperCase();
  const resourceId = pathParts[1] || null;

  if (!resourceType) return badRequest('resource_type_required');

  switch (resourceType) {
    case 'PRACTITIONER':
      return fhirPractitioner(env, resourceId);
    case 'PRACTITIONERROLE':
      return fhirPractitionerRole(env, resourceId);
    case 'ORGANIZATION':
      return fhirOrganization(env, resourceId);
    case 'LOCATION':
      return fhirLocation(env, resourceId);
    case 'HEALTHCARESERVICE':
      return fhirHealthcareService(env, resourceId);
    case 'ENDPOINT':
      return fhirEndpoint(env, resourceId);
    case 'QUALIFICATION':
      return fhirQualification(env, resourceId);
    default:
      return notFound(`Unknown resource type: ${resourceType}`);
  }
}

async function fhirSearch(request, env, pathParts) {
  const params = new URLSearchParams(pathParts.join('&'));
  const resourceType = params.get('type') || 'PRACTITIONER';

  switch (resourceType) {
    case 'PRACTITIONER':
      return fhirListPractitioners(env, params);
    case 'ORGANIZATION':
      return fhirListOrganizations(env, params);
    case 'LOCATION':
      return fhirListLocations(env, params);
    default:
      return notFound(`Unsupported search type: ${resourceType}`);
  }
}

// FHIR Practitioner resource
async function fhirPractitioner(env, id) {
  if (!id) return badRequest('practitioner_id_required');

  // Find by SPID
  const provider = await env.DB.prepare(
    'SELECT * FROM providers WHERE spid=?'
  ).bind(id).first();

  if (!provider) return notFound(`Practitioner not found: ${id}`);

  const identifiers = await env.DB.prepare(
    'SELECT * FROM provider_identifiers WHERE spid=?'
  ).bind(id).all();

  return json({
    resourceType: 'Practitioner',
    id: id,
    meta: {
      lastUpdated: new Date().toISOString(),
      versionId: '1',
      profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner'],
    },
    identifier: [
      {
        system: 'http://hl7.org/fhir/sid/us-npi',
        value: provider.npi || '',
        type: { coding: [{ code: 'NPI' }] },
      },
      {
        system: 'https://registry.brainsait.org/fhir/sid/spid',
        value: id,
        type: { coding: [{ code: 'SPID' }] },
      },
      {
        system: 'https://registry.brainsait.org/fhir/sid/oid',
        value: provider.oid,
        type: { coding: [{ code: 'OID' }] },
      },
      ...(provider.scfhs_file_number ? [{
        system: 'http://hl7.org/fhir/sid/x-nsqpp-tmpl',
        value: provider.scfhs_file_number,
        type: { coding: [{ code: 'SCFHS' }] },
      }] : []),
    ],
    active: provider.profile_status === 'published',
    name: [{
      use: 'official',
      family: provider.name_english?.split(' ').pop() || '',
      given: provider.name_english?.split(' ').slice(0, -1) || [provider.title_en || ''],
      text: provider.name_english,
      prefix: ['Dr.'],
      suffix: ['MD'],
    }, {
      use: 'official',
      text: provider.name_arabic || '',
    }],
    telecom: provider.primary_email ? [{
      system: 'email',
      value: provider.primary_email,
      use: ['work'],
    }] : [],
    gender: provider.gender === 'male' ? 'male' : provider.gender === 'female' ? 'female' : 'unknown',
    birthDate: provider.date_of_birth,
    photo: [{
      contentType: 'image/png',
      url: provider.gravatar_email
        ? `https://0.gravatar.com/avatar/${provider.gravatar_email.toLowerCase().trim()}?s=256`
        : '',
    }].filter(p => p.url),
    address: [], // Will be populated from Location
    communication: [{
      coding: [
        { system: 'urn:ietf:bcp:47', code: 'ar-SA', display: 'Arabic (Saudi)' },
        { system: 'urn:ietf:bcp:47', code: 'en', display: 'English' },
      ],
    }],
    qualification: [{
      code: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
          code: 'B',
          display: 'Bachelor\'s Degree',
        }],
      },
      period: { start: '2010-01-01' },
      issuer: {
        display: provider.primary_location?.organization_name_en || 'Unknown Institution',
      },
    }],
    extension: [{
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner-spec',
      valueString: provider.specialty || '',
    }],
  });
}

async function fhirPractitionerRole(env, spid) {
  const provider = await env.DB.prepare(
    'SELECT * FROM providers WHERE spid=?'
  ).bind(spid).first();

  if (!provider) return notFound(`PractitionerRole not found: ${spid}`);

  const locations = await env.DB.prepare(
    'SELECT * FROM provider_locations WHERE spid=?'
  ).bind(spid).all();

  return json({
    resourceType: 'PractitionerRole',
    id: `${spid}-role`,
    meta: {
      lastUpdated: new Date().toISOString(),
      versionId: '1',
    },
    identifier: [{
      system: 'https://registry.brainsait.org/fhir/sid/spid',
      value: spid,
    }],
    active: provider.profile_status === 'published',
    practitioner: {
      reference: `Practitioner/${spid}`,
      display: provider.name_english,
    },
    organization: {
      reference: `Organization/${provider.primary_location?.organization_id || 'unknown'}`,
      display: provider.primary_location?.organization_name_en || 'Unknown',
    },
    code: [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: provider.provider_type === 'physician' ? '309343006' : '46255001',
        display: provider.specialty || provider.provider_type,
      }],
    }],
    specialty: [{
      coding: [{
        system: 'http://hl7.org/fhir/us/canadian-charge-item/CodeSystem/ca-charge-item-specialty-codes',
        code: provider.specialty?.toLowerCase() || '',
        display: provider.specialty,
      }],
    }],
    location: locations.items?.map(loc => ({
      reference: `Location/${loc.id}`,
      display: loc.organization_name_en,
    })) || [],
    healthcareService: [{
      reference: `HealthcareService/${spid}-service`,
    }],
    endpoint: [{
      reference: `Endpoint/${spid}-endpoint`,
    }],
  });
}

async function fhirOrganization(env, id) {
  if (!id) return badRequest('organization_id_required');

  return json({
    resourceType: 'Organization',
    id: id,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    identifier: [{
      system: 'https://registry.brainsait.org/fhir/sid/org',
      value: id,
    }],
    active: true,
    type: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/organization-type',
        code: 'prov',
        display: 'Healthcare Provider',
      }],
    }],
    name: `Organization ${id}`,
    alias: [`org_${id}`],
    telecom: [{
      system: 'email',
      value: 'contact@brainsait.org',
    }],
    address: [{
      use: 'work',
      type: 'physical',
      text: 'Riyadh, Saudi Arabia',
      line: ['Kingdom of Saudi Arabia'],
      city: 'Riyadh',
      state: 'Riyadh Province',
      postalCode: '11564',
      country: 'SA',
    }],
  });
}

async function fhirLocation(env, id) {
  if (!id) return badRequest('location_id_required');

  return json({
    resourceType: 'Location',
    id: id,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    identifier: [{
      system: 'https://registry.brainsait.org/fhir/sid/location',
      value: id,
    }],
    active: true,
    name: `Healthcare Facility ${id}`,
    status: 'active',
    mode: 'instance',
    operationalStatus: {
      coding: [{ code: 'A', display: 'Open' }],
    },
    type: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
        code: 'HOSP',
        display: 'Hospital',
      }],
    }],
    endpoint: [{
      reference: `Endpoint/${id}-endpoint`,
    }],
    address: {
      use: 'work',
      type: 'physical',
      text: 'Riyadh, Saudi Arabia',
      city: 'Riyadh',
      state: 'Riyadh Province',
      postalCode: '11564',
      country: 'SA',
    },
    physicalType: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/location-physical-type',
        code: 'bu',
        display: 'Building',
      }],
    },
    managingOrganization: {
      reference: 'Organization/brainsait',
      display: 'BrainSAIT LTD',
    },
  });
}

async function fhirHealthcareService(env, spid) {
  const provider = await env.DB.prepare(
    'SELECT * FROM providers WHERE spid=?'
  ).bind(spid).first();

  if (!provider) return notFound(`HealthcareService not found: ${spid}`);

  return json({
    resourceType: 'HealthcareService',
    id: `${spid}-service`,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    identifier: [{
      system: 'https://registry.brainsait.org/fhir/sid/healthcareservice',
      value: `${spid}-service`,
    }],
    active: provider.profile_status === 'published',
    providedBy: {
      reference: `Organization/brainsait`,
    },
    category: [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: provider.provider_type === 'physician' ? '309343006' : '46255001',
        display: provider.specialty || provider.provider_type,
      }],
    }],
    specialty: [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: provider.specialty?.toLowerCase() || '',
        display: provider.specialty,
      }],
    }],
    location: [{
      reference: `Location/${spid}-location`,
    }],
    endpoint: [{
      reference: `Endpoint/${spid}-endpoint`,
    }],
    name: `Healthcare Service - ${provider.name_english}`,
    comment: provider.bio_en,
    coverageArea: [{
      reference: `Location/${spid}-location`,
    }],
    program: ['SCFHS Verified', 'NPHIES Compliant'],
    programName: ['Saudi Commission for Health Specialties', 'National Platform for Health and Insurance Exchange Services'],
    characteristics: [{
      coding: [{
        system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-healthcare-service-characteristics',
        code: 'LANGUAGE',
        display: 'Languages',
      }],
    }, {
      coding: [{
        system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-healthcare-service-characteristics',
        code: 'OPERATIONAL_STATUS',
        display: 'Operational Status',
      }],
    }],
    communication: ['ar-SA', 'en'],
    nameArabic: provider.name_arabic || '',
  });
}

async function fhirEndpoint(env, spid) {
  return json({
    resourceType: 'Endpoint',
    id: `${spid}-endpoint`,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    identifier: [{
      system: 'https://registry.brainsait.org/fhir/sid/endpoint',
      value: `${spid}-endpoint`,
    }],
    status: 'active',
    name: `Provider Endpoint - ${spid}`,
    contact: [{
      system: 'email',
      value: 'api@brainsait.org',
    }],
    payloadType: [{
      coding: [{
        system: 'http://hl7.org/fhir/restful-interaction',
        code: 'search-system',
        display: 'Search All',
      }],
    }],
    mimeType: ['application/fhir+json', 'application/json'],
    organization: {
      reference: 'Organization/brainsait',
    },
    addressing: 'https://registry.brainsait.org/fhir/',
  });
}

async function fhirQualification(env, spid) {
  const provider = await env.DB.prepare(
    'SELECT * FROM providers WHERE spid=?'
  ).bind(spid).first();

  if (!provider) return notFound(`Qualification not found: ${spid}`);

  return json({
    resourceType: 'Qualification',
    id: `${spid}-qual`,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    identifier: [{
      system: 'https://registry.brainsait.org/fhir/sid/qualification',
      value: `${spid}-qual`,
    }],
    practitioner: {
      reference: `Practitioner/${spid}`,
    },
    code: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
        code: 'B',
        display: 'Bachelor\'s Degree',
      }],
    }],
    period: {
      start: '2010-01-01',
      end: provider.scfhs_file_number ? undefined : null,
    },
    issuer: {
      reference: 'Organization/scfhs',
      display: 'Saudi Commission for Health Specialties',
    },
  });
}

// List Practitioners
async function fhirListPractitioners(env, params) {
  const query = `SELECT * FROM providers WHERE profile_status='published' ORDER BY created_at DESC LIMIT 100`;
  const results = await env.DB.prepare(query).all();

  const entry = (results.items || []).map(provider => ({
    fullUrl: `Practitioner/${provider.spid}`,
    resource: {
      resourceType: 'Practitioner',
      id: provider.spid,
      identifier: [{
        system: 'https://registry.brainsait.org/fhir/sid/spid',
        value: provider.spid,
      }],
      name: [{
        text: provider.name_english,
      }],
    },
  }));

  return json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: entry.length,
    link: [{
      relation: 'self',
      url: 'https://registry.brainsait.org/fhir/$search?type=PRACTITIONER',
    }],
    entry,
  });
}

// List Organizations
async function fhirListOrganizations(env, params) {
  return json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: 1,
    entry: [{
      fullUrl: 'Organization/brainsait',
      resource: {
        resourceType: 'Organization',
        id: 'brainsait',
        name: 'BrainSAIT LTD',
        alias: ['BrainSAIT'],
        telecom: [{ system: 'email', value: 'info@brainsait.org' }],
        address: [{
          text: 'Riyadh, Saudi Arabia',
          city: 'Riyadh',
          country: 'SA',
        }],
      },
    }],
  });
}

// List Locations
async function fhirListLocations(env, params) {
  return json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: 0,
    entry: [],
  });
}