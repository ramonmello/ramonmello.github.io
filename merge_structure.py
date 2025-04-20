#!/usr/bin/env python3
import os
import argparse
from collections import defaultdict

OUTPUT_DIR = "FOR_AI"

def merge_files_in_group(items, output_name, ext_list):
    """
    Gera um arquivo de saída chamado <output_name><ext_list[0]> em OUTPUT_DIR contendo
    a concatenação de todos os arquivos em `items`.
    Cada item é uma tupla (caminho_completo, caminho_relativo_para_identificação).
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"{output_name.lower()}{ext_list[0]}"
    output_path = os.path.join(OUTPUT_DIR, filename)
    with open(output_path, 'w', encoding='utf-8') as out_file:
        for full_path, rel_path in items:
            out_file.write(f"// Início do arquivo: {rel_path}\n")
            with open(full_path, 'r', encoding='utf-8') as in_file:
                out_file.write(in_file.read())
            out_file.write(f"\n// Fim do arquivo: {rel_path}\n\n")
    print(f"Arquivo gerado: {output_path}")

def main():
    parser = argparse.ArgumentParser(
        description='Mescla arquivos .ts e .tsx recursivamente: cria um .ts por última pasta e um para arquivos soltos na raiz, todos em FOR_AI.'
    )
    parser.add_argument(
        'directory',
        help='Diretório raiz a ser processado (ex: Predio).'
    )
    parser.add_argument(
        '-e', '--extensions',
        default='.ts,.tsx',
        help="Lista de extensões separadas por vírgula (padrão: '.ts,.tsx')."
    )
    args = parser.parse_args()

    directory = os.path.normpath(args.directory)
    if not os.path.isdir(directory):
        raise NotADirectoryError(f"'{directory}' não é um diretório válido.")
    base_name = os.path.basename(directory)
    ext_list = [e.strip() for e in args.extensions.split(',') if e.strip()]
    if not ext_list:
        raise ValueError("Nenhuma extensão válida em --extensions.")

    # Agrupa todos os arquivos pela última pasta (ou pela raiz, se estiver na raiz)
    groups = defaultdict(list)
    for root_dir, _, files in os.walk(directory):
        for fname in sorted(files):
            if any(fname.endswith(ext) for ext in ext_list):
                full = os.path.join(root_dir, fname)
                rel = "/" + os.path.join(base_name, os.path.relpath(full, directory)).replace(os.sep, '/')
                parent = os.path.basename(root_dir) if root_dir != directory else base_name
                groups[parent].append((full, rel))

    # Para cada grupo, gera o arquivo correspondente
    for parent in sorted(groups):
        items = groups[parent]
        output_name = f"{base_name}_{parent}" if parent != base_name else base_name
        merge_files_in_group(items, output_name, ext_list)

if __name__ == '__main__':
    main()
