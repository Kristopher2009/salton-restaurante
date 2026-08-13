# Salton Buffet & Marmitaria — Site local

Instruções para usar a logo fornecida e executar o site localmente.

1. Salve a imagem da logo (fornecida pelo proprietário) em `public/logo.png`.
   - No chat, faça download da imagem anexa e mova/renomeie para `public/logo.png`.

2. Instale dependências e rode o servidor:

```bash
npm install
npm start
```

3. Abra no navegador:

```
http://localhost:3000
```

Observações:
- O código já usa `public/logo.png` como primeira opção; caso o arquivo não exista, ele faz fallback para `public/logo.svg`.
- O pedido no front-end salva o pedido no banco SQLite (`data/salton.db`) e abre o WhatsApp do dono: `+55 47 9263-7239`.
- Se precisar, converta a imagem para `.png` com ferramentas comuns (Photoshop, Paint, `convert`, etc.).
