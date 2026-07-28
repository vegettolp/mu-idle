import os
import requests
import time

output_dir = r"C:\MeusProjetos\MU-Idle\client\public\assets\sprites\items"
os.makedirs(output_dir, exist_ok=True)

BASE_URL = "https://muonlinefanz.com/tools/items/data/graphics/"

ITEMS = [
    # Weapons
    "Short Sword.jpg", "Rapier.jpg", "Scimitar.jpg", "Blade.jpg", "Light Saber.jpg",
    "Serpent Staff.jpg", "Skull Staff.jpg", "Archangel Staff.jpg",
    "Short Bow.jpg", "Elven Bow.jpg", "Titan Bow.jpg",
    # Armors - Leather
    "Leather Helm.jpg", "Leather Armor.jpg", "Leather Pants.jpg", "Leather Gloves.jpg", "Leather Boots.jpg",
    # Armors - Bronze
    "Bronze Helm.jpg", "Bronze Armor.jpg", "Bronze Pants.jpg", "Bronze Gloves.jpg", "Bronze Boots.jpg",
    # Armors - Pad
    "Pad Helm.jpg", "Pad Armor.jpg", "Pad Pants.jpg", "Pad Gloves.jpg", "Pad Boots.jpg",
    # Accessories
    "Ring of Ice.jpg", "Ring of Fire.jpg", "Amulet of Health.jpg",
]

print("📥 Baixando imagens dos itens do MU Online...")
print(f"📁 Pasta: {output_dir}\n")

success = 0
failed = 0

for item in ITEMS:
    try:
        url = BASE_URL + item.replace(" ", "%20")
        name = item.replace(".jpg", "").replace(" ", "_").lower()
        
        print(f"⬇️  {item}...", end=" ")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            filepath = os.path.join(output_dir, f"{name}.jpg")
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print("✅")
            success += 1
        else:
            print(f"❌ ({response.status_code})")
            failed += 1
        
        time.sleep(0.3)
    except Exception as e:
        print(f"❌ {e}")
        failed += 1

print(f"\n📊 {success} baixados, {failed} falhas")
print("✅ Pronto!")