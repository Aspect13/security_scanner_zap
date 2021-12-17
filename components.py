from flask import render_template


def render_toggle(context, slot, payload):
    integrations = context.rpc_manager.call.integrations_get_project_integrations_by_name(
        payload['id'],
        'security_scanner_zap'
    )
    payload['project_integrations'] = integrations
    return render_template(
        'security_scanner_zap:zap_test_toggle.html',
        config=payload
    )


def render_integration_create_modal(context, slot, payload):
    return render_template(
        'security_scanner_zap:zap_integration.html',
        config=payload
    )


def render_integration_card(context, slot, payload):
    return render_template(
        'security_scanner_zap:zap_integration_card.html',
        config=payload
    )
