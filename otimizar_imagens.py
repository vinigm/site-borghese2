#!/usr/bin/env python3
"""
Script de Otimização de Imagens para Site Imobiliário
Converte imagens JPG/PNG para WebP mantendo qualidade visual

Autor: Sistema de Automação
Data: Fevereiro 2026
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageOps
from tqdm import tqdm
import shutil


class OtimizadorImagens:
    """Classe para otimização de imagens do site"""
    
    def __init__(self, pasta_origem, pasta_destino='output_images'):
        """
        Inicializa o otimizador de imagens
        
        Args:
            pasta_origem: Pasta com as imagens originais
            pasta_destino: Pasta onde serão salvas as imagens otimizadas
        """
        self.pasta_origem = Path(pasta_origem)
        self.pasta_destino = Path(pasta_destino)
        self.extensoes_suportadas = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        self.tamanho_total_original = 0
        self.tamanho_total_otimizado = 0
        self.imagens_processadas = 0
        self.imagens_com_erro = []
        
    def encontrar_imagens(self):
        """
        Encontra todas as imagens nas pastas e subpastas
        
        Returns:
            Lista de Path objects com os caminhos das imagens
        """
        imagens = []
        for ext in self.extensoes_suportadas:
            imagens.extend(self.pasta_origem.rglob(f'*{ext}'))
        return sorted(imagens)
    
    def obter_tamanho_arquivo(self, caminho):
        """
        Obtém o tamanho de um arquivo em bytes
        
        Args:
            caminho: Path do arquivo
            
        Returns:
            Tamanho em bytes
        """
        try:
            return caminho.stat().st_size
        except:
            return 0
    
    def converter_para_webp(self, caminho_origem, caminho_destino):
        """
        Converte uma imagem para formato WebP
        
        Args:
            caminho_origem: Path da imagem original
            caminho_destino: Path onde salvar a imagem WebP
            
        Returns:
            Tuple (sucesso: bool, tamanho_original: int, tamanho_otimizado: int)
        """
        try:
            # Obtém tamanho original
            tamanho_original = self.obter_tamanho_arquivo(caminho_origem)
            
            # Abre e corrige orientação da imagem
            with Image.open(caminho_origem) as img:
                # Corrige a orientação baseada no EXIF antes de remover os metadados
                img = ImageOps.exif_transpose(img)
                
                # Converte RGBA para RGB se necessário (WebP com transparência é maior)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Cria fundo branco
                    fundo = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    # Compõe a imagem sobre o fundo branco
                    fundo.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = fundo
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Cria a pasta de destino se não existir
                caminho_destino.parent.mkdir(parents=True, exist_ok=True)
                
                # Salva em WebP com alta qualidade e compressão eficiente
                # quality=90: Mantém qualidade visual excelente
                # method=6: Compressão mais lenta mas mais eficiente (0-6, sendo 6 o melhor)
                img.save(
                    caminho_destino,
                    'WEBP',
                    quality=90,
                    method=6,
                    optimize=True
                )
            
            # Obtém tamanho otimizado
            tamanho_otimizado = self.obter_tamanho_arquivo(caminho_destino)
            
            return True, tamanho_original, tamanho_otimizado
            
        except Exception as e:
            print(f"\n⚠️  Erro ao processar {caminho_origem.name}: {str(e)}")
            return False, 0, 0
    
    def processar_imagens(self):
        """
        Processa todas as imagens encontradas
        """
        # Encontra todas as imagens
        print(f"🔍 Buscando imagens em: {self.pasta_origem}")
        imagens = self.encontrar_imagens()
        
        if not imagens:
            print(f"❌ Nenhuma imagem encontrada em {self.pasta_origem}")
            return
        
        print(f"✅ Encontradas {len(imagens)} imagens para processar\n")
        
        # Processa cada imagem com barra de progresso
        for caminho_original in tqdm(imagens, desc="🖼️  Otimizando imagens", unit="img"):
            # Calcula o caminho relativo
            caminho_relativo = caminho_original.relative_to(self.pasta_origem)
            
            # Define o caminho de destino (troca extensão para .webp)
            caminho_destino = self.pasta_destino / caminho_relativo.with_suffix('.webp')
            
            # Converte a imagem
            sucesso, tam_orig, tam_otim = self.converter_para_webp(
                caminho_original,
                caminho_destino
            )
            
            if sucesso:
                self.tamanho_total_original += tam_orig
                self.tamanho_total_otimizado += tam_otim
                self.imagens_processadas += 1
            else:
                self.imagens_com_erro.append(str(caminho_original))
    
    def exibir_resumo(self):
        """
        Exibe um resumo das otimizações realizadas
        """
        print("\n" + "=" * 70)
        print("📊 RESUMO DA OTIMIZAÇÃO")
        print("=" * 70)
        
        # Estatísticas de processamento
        print(f"\n✅ Imagens processadas com sucesso: {self.imagens_processadas}")
        
        if self.imagens_com_erro:
            print(f"⚠️  Imagens com erro: {len(self.imagens_com_erro)}")
            for img in self.imagens_com_erro[:5]:  # Mostra até 5 erros
                print(f"   - {img}")
            if len(self.imagens_com_erro) > 5:
                print(f"   ... e mais {len(self.imagens_com_erro) - 5} imagens")
        
        # Estatísticas de tamanho
        if self.imagens_processadas > 0:
            print(f"\n📦 Tamanho original total: {self.formatar_tamanho(self.tamanho_total_original)}")
            print(f"📦 Tamanho otimizado total: {self.formatar_tamanho(self.tamanho_total_otimizado)}")
            
            economia = self.tamanho_total_original - self.tamanho_total_otimizado
            percentual = (economia / self.tamanho_total_original * 100) if self.tamanho_total_original > 0 else 0
            
            print(f"\n💾 Economia de espaço: {self.formatar_tamanho(economia)}")
            print(f"📉 Redução percentual: {percentual:.1f}%")
            
            # Calcula média por imagem
            economia_media = economia / self.imagens_processadas
            print(f"\n📊 Economia média por imagem: {self.formatar_tamanho(economia_media)}")
        
        print(f"\n📁 Imagens otimizadas salvas em: {self.pasta_destino.absolute()}")
        print("=" * 70)
    
    @staticmethod
    def formatar_tamanho(bytes_size):
        """
        Formata bytes para formato legível (KB, MB, GB)
        
        Args:
            bytes_size: Tamanho em bytes
            
        Returns:
            String formatada
        """
        for unidade in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unidade}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} TB"
    
    def executar(self):
        """
        Executa todo o processo de otimização
        """
        print("\n" + "=" * 70)
        print("🚀 OTIMIZADOR DE IMAGENS - SITE BORGHESE")
        print("=" * 70)
        print(f"Pasta de origem: {self.pasta_origem.absolute()}")
        print(f"Pasta de destino: {self.pasta_destino.absolute()}")
        print("=" * 70 + "\n")
        
        # Verifica se a pasta de origem existe
        if not self.pasta_origem.exists():
            print(f"❌ Erro: A pasta {self.pasta_origem} não existe!")
            return
        
        # Processa as imagens
        self.processar_imagens()
        
        # Exibe resumo
        self.exibir_resumo()


def main():
    """
    Função principal do script
    """
    # Verifica se tqdm está instalado
    try:
        import tqdm
    except ImportError:
        print("❌ Biblioteca 'tqdm' não encontrada!")
        print("📦 Instale com: pip install tqdm")
        sys.exit(1)
    
    # Verifica se Pillow está instalado
    try:
        from PIL import Image
    except ImportError:
        print("❌ Biblioteca 'Pillow' não encontrada!")
        print("📦 Instale com: pip install Pillow")
        sys.exit(1)
    
    # Configuração padrão
    pasta_origem = 'assets/images'
    pasta_destino = 'output_images'
    
    # Permite passar pasta customizada via argumento
    if len(sys.argv) > 1:
        pasta_origem = sys.argv[1]
    if len(sys.argv) > 2:
        pasta_destino = sys.argv[2]
    
    # Cria e executa o otimizador
    otimizador = OtimizadorImagens(pasta_origem, pasta_destino)
    otimizador.executar()
    
    print("\n✨ Processo concluído!")
    print("\n💡 Próximos passos:")
    print("   1. Revise as imagens em 'output_images' para garantir a qualidade")
    print("   2. Substitua as imagens originais no site pelas versões WebP")
    print("   3. Atualize os caminhos no HTML/CSS/JS para usar .webp")
    print("   4. Configure fallback para navegadores antigos se necessário\n")


if __name__ == '__main__':
    main()
