import os
from rembg import remove
from PIL import Image

input_dir = r"C:\MeusProjetos\MU-Idle\client\public\assets\sprites\items"
output_dir = r"C:\MeusProjetos\MU-Idle\client\public\assets\sprites\items_transparent"
os.makedirs(output_dir, exist_ok=True)

print("🎨 Removendo fundo das imagens...")

count = 0
failed = 0

for filename in os.listdir(input_dir):
    if filename.endswith(('.jpg', '.jpeg', '.png', '.gif')):
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename.replace('.jpg', '.png').replace('.jpeg', '.png').replace('.gif', '.png'))
        
        print(f"🖼️  {filename}...", end=" ")
        
        try:
            # Verificar se a imagem é válida
            img = Image.open(input_path)
            img.verify()
            
            # Reabrir após verify()
            img = Image.open(input_path)
            
            # Remover fundo
            with open(input_path, 'rb') as f:
                input_data = f.read()
            
            output_data = remove(input_data)
            
            with open(output_path, 'wb') as f:
                f.write(output_data)
            
            print("✅")
            count += 1
            
        except Exception as e:
            print(f"❌ ({str(e)[:50]})")
            failed += 1

print(f"\n✅ {count} sucesso, ❌ {failed} falhas")
print(f"📁 Imagens transparentes em: {output_dir}")