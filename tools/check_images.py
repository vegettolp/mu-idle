import os
from PIL import Image

input_dir = r"C:\MeusProjetos\MU-Idle\client\public\assets\sprites\items"

print("🔍 Verificando imagens...\n")

for filename in os.listdir(input_dir):
    if filename.endswith(('.jpg', '.jpeg', '.png', '.gif')):
        filepath = os.path.join(input_dir, filename)
        size_kb = os.path.getsize(filepath) / 1024
        
        try:
            img = Image.open(filepath)
            img.verify()
            status = "✅" if size_kb > 1 else "⚠️ (muito pequeno)"
            print(f"{status} {filename} ({size_kb:.1f} KB)")
        except:
            print(f"❌ {filename} - CORROMPIDO")

print("\n⚠️ Arquivos com menos de 1KB provavelmente são páginas de erro.")