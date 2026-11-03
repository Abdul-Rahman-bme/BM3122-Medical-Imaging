"""Read-only PDF preprocessing. Output is REVIEW MATERIAL, never an automatic question import.
Usage: python scripts/preprocess_pdf.py path/to/source.pdf --out data/review/source
Requires pypdf and pypdfium2 (pip install pypdf pypdfium2).
"""
import argparse,json
from pathlib import Path
from pypdf import PdfReader
def main():
 p=argparse.ArgumentParser();p.add_argument('pdf',type=Path);p.add_argument('--out',type=Path,required=True);args=p.parse_args()
 args.out.mkdir(parents=True,exist_ok=True);reader=PdfReader(args.pdf)
 pages=[]
 for i,page in enumerate(reader.pages,1):
  text=page.extract_text() or '';pages.append({'page':i,'text':text,'requiresManualTranscription':len(text.strip())<80})
  (args.out/f'page-{i:03}.txt').write_text(text,encoding='utf-8')
 try:
  import pypdfium2 as pdfium
  doc=pdfium.PdfDocument(args.pdf)
  for i in range(len(doc)):doc[i].render(scale=1.5).to_pil().save(args.out/f'page-{i+1:03}.png')
 except ImportError:print('pypdfium2 not installed; text only. Visually inspect original PDF.')
 (args.out/'review.json').write_text(json.dumps({'source':args.pdf.name,'status':'REVIEW REQUIRED - NOT IMPORTED','pages':pages,'instructions':['Verify original question numbering, marks and full statements.','Review every formula and figure against page images.','Scanned pages require manual transcription.','Use stable IDs and data/content.json schema.','Validate complete paper and rubric totals in Settings before import.']},indent=2),encoding='utf-8')
 print(f'{len(pages)} pages extracted for review. No question database changed.')
if __name__=='__main__':main()
