
/**
 * MiauExportEngine - O motor de exportação da gatinha, agora livre de amarras!
 * Usa a File System Access API para uma experiência desktop nativa no browser.
 */

export class MiauExportEngine {
  
  /**
   * Converte DataURL ou Blob para um formato que o sistema entenda.
   */
  private static async getBlob(source: string | Blob): Promise<Blob> {
    if (source instanceof Blob) return source;
    const response = await fetch(source);
    return await response.blob();
  }

  /**
   * Tenta salvar usando a API de Sistema de Arquivos (Desktop)
   * Fallback para download clássico se não suportado ou cancelado.
   */
  public static async saveImage(dataUrl: string, defaultName: string) {
    const blob = await this.getBlob(dataUrl);
    
    // Verifica se o navegador suporta a API de escolha de arquivo (Chrome/Edge/Opera Desktop)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultName,
          types: [{
            description: 'Imagem PNG',
            accept: { 'image/png': ['.png'] }
          }],
        });
        
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.debug(`[MiauExport] Salvo com sucesso via FileSystem API: ${defaultName}`);
        return;
      } catch (err: any) {
        // Se o usuário cancelar (AbortError), a gente não faz nada.
        // Se for outro erro, tentamos o download clássico.
        if (err.name === 'AbortError') return;
        console.warn("[MiauExport] FileSystem API falhou, tentando fallback...", err);
      }
    }

    // Fallback: Download clássico do navegador
    this.webDownload(dataUrl, defaultName);
  }

  /**
   * Salva o arquivo ZIP perguntando o local (se possível).
   */
  public static async saveZip(blob: Blob, defaultName: string) {
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultName,
          types: [{
            description: 'Arquivo ZIP',
            accept: { 'application/zip': ['.zip'] }
          }],
        });
        
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    
    const url = URL.createObjectURL(blob);
    this.webDownload(url, defaultName);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /**
   * O bom e velho link temporário para download.
   */
  private static webDownload(url: string, name: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
