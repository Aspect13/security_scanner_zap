from typing import Optional, List

from pydantic import BaseModel, AnyUrl
from pydantic.class_validators import validator
from pydantic.fields import ModelField
from pylon.core.tools import log


class IntegrationModel(BaseModel):

    scan_types: List[str] = ['all']
    auth_login: Optional[str] = 'user'
    auth_password: Optional[str] = 'P@ssw0rd'
    auth_script: Optional[str] = """
        - {command: open, target: '%Target%/login', value: ''}
        - {command: waitForElementPresent, target: id=login_login, value: ''}
        - {command: waitForElementPresent, target: id=login_password, value: ''}
        - {command: waitForElementPresent, target: id=login_0, value: ''}
        - {command: type, target: id=login_login, value: '%Username%'}
        - {command: type, target: id=login_password, value: '%Password%'}
        - {command: clickAndWait, target: id=login_0, value: ''}
    """

    bind_all_interfaces: Optional[bool] = True
    daemon_debug: Optional[bool] = False
    java_options: Optional[str] = '-Xmx1g'
    split_by_endpoint: Optional[bool] = False
    passive_scan_wait_threshold: Optional[int] = 0
    passive_scan_wait_limit: Optional[int] = 600

    external_zap_daemon: Optional[AnyUrl] = 'http://192.168.0.2:8091'
    external_zap_api_key: Optional[str] = 'dusty'
    save_intermediates_to: Optional[str] = '/data/intermediates/dast'


    def check_connection(self) -> bool:
        try:
            return True
        except Exception as e:
            log.exception(e)
            return False

    @validator('scan_types')
    def validate_scan_types(cls, value: str, field: ModelField):
        assert value.lower() in ['all', 'xss', 'sqli'], f'Value [{value}] must be in ["all", "xss", "sqli"]'
        return value.lower()

    @validator('java_options')
    def validate_java_options(cls, value: str, field: ModelField):
        assert value.startswith('-'), ''
        return value.lower()
