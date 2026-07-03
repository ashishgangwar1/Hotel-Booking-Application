import requests
from django.conf import settings


def get_access_token():
    url = "https://api-m.sandbox.paypal.com/v1/oauth2/token"

    response = requests.post(
        url,
        auth=(
            settings.PAYPAL_CLIENT_ID,
            settings.PAYPAL_SECRET
        ),
        data={
            "grant_type": "client_credentials"
        }
    )

    response.raise_for_status()

    return response.json()["access_token"]


def create_order(payment):
    token = get_access_token()

    url = "https://api-m.sandbox.paypal.com/v2/checkout/orders"

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": str(payment.amount)
                }
            }
        ],
        "application_context": {
            "return_url": "http://127.0.0.1:8000/api/payments/success/",
            "cancel_url": "http://127.0.0.1:8000/api/payments/cancel/",
            "user_action": "PAY_NOW"
        }
    }

    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        json=payload
    )

    response.raise_for_status()

    return response.json()


def capture_order(order_id):
    token = get_access_token()

    url = (
        f"https://api-m.sandbox.paypal.com"
        f"/v2/checkout/orders/{order_id}/capture"
    )

    response = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={}
    )

    response.raise_for_status()

    return response.json()