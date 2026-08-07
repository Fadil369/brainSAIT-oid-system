# DICOM UID Allocation Guide
## BrainSAIT IANA PEN 61026 — Healthcare OID Branch

## Your DICOM UID Root

```
DICOM UID Prefix: 1.3.6.1.4.1.61026.3
```

## Allocation Scheme

### SOP Class UIDs

Format: `1.3.6.1.4.1.61026.3.<service>.<class>.<version>`

| Service | Node | Example UID |
|---------|------|-------------|
| NPHIES Integration | 2.3 | 1.3.6.1.4.1.61026.3.2.3.1 |
| AI Agent Framework | 3.1 | 1.3.6.1.4.1.61026.3.3.1 |

### Study Instance UIDs

Format: `1.3.6.1.4.1.61026.3.2.3.<YYYYMMDD>.<HHMMSS>.<sequence>`

### Python (pydicom)

```python
import pydicom
from datetime import datetime

def generate_brainsait_uid(service_node="3.2.3"):
    prefix = f"1.3.6.1.4.1.61026.{service_node}"
    timestamp = datetime.utcnow().strftime("%Y%m%d.%H%M%S")
    return f"{prefix}.{timestamp}"

ds = pydicom.dcmread("template.dcm")
ds.StudyInstanceUID = generate_brainsait_uid()
ds.save_as("output.dcm")
```

## Support

- DICOM Integration: dicom@brainsait.com
