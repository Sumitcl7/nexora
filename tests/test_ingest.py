import time
from ingest_lambda.ingest import validate_payload

def test_validate_payload_ok():
    payload = {'device_id':'dev1','timestamp':int(time.time()),'value':12.3}
    assert validate_payload(payload)

def test_validate_payload_bad():
    assert not validate_payload({})
