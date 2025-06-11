import requests
import json
from typing import List, Dict, Optional

class MailerLiteAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://connect.mailerlite.com/api"
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

    def create_group(self, group_name: str) -> Optional[str]:
        """Create a new group and return its ID"""
        endpoint = f"{self.base_url}/groups"
        data = {"name": group_name}
        
        response = requests.post(endpoint, headers=self.headers, json=data)
        
        if response.status_code in [200, 201]:
            return response.json()["data"]["id"]
        else:
            print(f"Error creating group: {response.text}")
            return None

    def add_subscriber_to_group(self, email: str, group_id: str, fields: Dict = None) -> bool:
        """Add a subscriber to a specific group"""
        endpoint = f"{self.base_url}/subscribers"
        
        data = {
            "email": email,
            "groups": [group_id]
        }
        
        if fields:
            data["fields"] = fields
            
        response = requests.post(endpoint, headers=self.headers, json=data)
        
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"Error adding subscriber: {response.text}")
            return False

    def bulk_add_subscribers_to_group(self, subscribers: List[Dict], group_id: str) -> bool:
        """Bulk add subscribers to a specific group"""
        endpoint = f"{self.base_url}/groups/{group_id}/import-subscribers"
        
        data = {
            "subscribers": subscribers
        }
        
        response = requests.post(endpoint, headers=self.headers, json=data)
        
        if response.status_code == 200:
            return True
        else:
            print(f"Error bulk adding subscribers: {response.text}")
            return False

# Example usage:
if __name__ == "__main__":
    # Initialize the API with your API key
    api_key = "YOUR_API_KEY"
    api = MailerLiteAPI(api_key)
    
    # Create a new group
    group_id = api.create_group("Newsletter Subscribers")
    
    if group_id:
        # Add a single subscriber
        success = api.add_subscriber_to_group(
            "example@email.com",
            group_id,
            fields={"name": "John", "last_name": "Doe"}
        )
        print(f"Single subscriber added: {success}")
        
        # Bulk add subscribers
        subscribers = [
            {
                "email": "subscriber1@email.com",
                "fields": {"name": "Subscriber", "last_name": "One"}
            },
            {
                "email": "subscriber2@email.com",
                "fields": {"name": "Subscriber", "last_name": "Two"}
            }
        ]
        
        success = api.bulk_add_subscribers_to_group(subscribers, group_id)
        print(f"Bulk subscribers added: {success}") 