# GIFs próprios do Forjar

A API gratuita da ExerciseDB restringe o uso a projetos não comerciais. Por isso, os GIFs dela não devem ser copiados para o Supabase do Forjar.

## Padrão de produção

- Grave com fundo neutro e câmera fixa.
- Mostre de 2 a 3 repetições controladas e a amplitude completa.
- Corte o loop para 3 a 6 segundos, sem texto sobre o movimento.
- Exporte como GIF, WebP animado ou MP4, com no máximo 5 MB.
- O profissional de educação física deve revisar execução, nome e instruções.

## Importação

Execute a migração `202607220002_exercise_library.sql`, coloque os arquivos e um `manifest.json` na pasta local `exercise-media` e rode `npm run exercises:import`.

Cada item registra nome, arquivo, origem, licença, dificuldade, músculos, equipamentos e instruções. O campo `licenseConfirmed` precisa estar como `true`.

O importador pode ser repetido sem duplicar registros, usa somente três envios simultâneos e mantém a chave secreta fora do navegador.

