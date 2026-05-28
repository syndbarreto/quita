# Projeto Quita - Regras Permanentes para Codex

## Papel do Codex

O Codex deve agir como um desenvolvedor fixo do projeto Quita.

Todas as telas, componentes e estilos devem seguir a identidade visual existente no projeto. Nunca gerar componentes totalmente diferentes do padrão atual. O app inteiro deve parecer um único produto consistente.

## Identidade Visual

O Quita segue um estilo:

- colorful UI
- playful UI
- wellness app
- mobile first
- soft modern UI
- visual amigável
- emocionalmente acolhedor
- divertido
- vibrante
- organizado
- arredondado
- moderno
- acessível


## Regras Gerais

- Nunca criar interfaces dark mode.
- Nunca deixar o visual corporativo.
- Nunca usar visual minimalista extremo.
- Nunca criar componentes fora do padrão atual.
- Sempre reutilizar componentes existentes antes de criar novos.
- Sempre manter consistência visual.
- Sempre manter aparência amigável, colorful e playful.
- Priorizar UX mobile.
- Manter o projeto visualmente leve, divertido e acolhedor.
- Não fazer refactors grandes sem necessidade.
- Não misturar responsabilidades de páginas diferentes.

## Estrutura do Projeto

O projeto usa uma organização simples baseada em Models e Views.

- HTML fica responsável pela estrutura da tela.
- CSS fica responsável pelo visual e estilo.
- JavaScript de interação visual fica em `views/`.
- Dados ou estruturas reutilizáveis ficam em `models/`, quando existirem.
- Não usar JavaScript inline dentro do HTML.
- Não usar CSS inline com `style=""`.
- Não criar arquivos duplicados para telas que fazem parte do mesmo fluxo.

Estrutura esperada:

```txt
assets/
css/
  global.css
  variables.css
  pages/
    onboarding.css
    history.css
    welcome.css
views/
  onboardingView.js
models/
onboarding.html
history.html
index.html
```

## Sistema de Cores

Todas as cores oficiais devem vir de:

```txt
css/variables.css
```

Tokens atuais:

```css
--background: #fffcf5;
--purple: #4a2e6e;
--blue: #465ae1;
--light-blue: #63a7f7;
--yellow: #ffd719;
--light-yellow: #fff080;
--mint: #69e093;
--light-green: #d2d741;
--light-red: #ff1d25;
--dark-red: #b20202;
--dark-orange: #f55a32;
--light-orange: #ff7b02;
--light-pink: #ffaac3;
--light-grey: #787880;
--text-primary: #3e3c3d;
--text-secondary: #68655e;
--placeholder: #727272;
--white: #ffffff;
--black: #000000;
```

Regras obrigatórias:

- Evitar usar `hex`, `rgb`, `rgba` ou `hsl` diretamente em novos estilos.
- Sempre procurar primeiro uma variável em `css/variables.css`.
- Sempre usar `var(--nome-da-cor)` quando a cor já existir.
- Não inventar cores novas soltas no CSS.
- Se uma cor nova for realmente necessária, adicionar primeiro em `css/variables.css` com um nome claro.

Exemplo correto:

```css
background: var(--blue);
color: var(--background);
```

Exemplo proibido em código novo:

```css
background: #465ae1;
```

Observação: se arquivos antigos já tiverem valores soltos, não fazer limpeza global sem pedido explícito. Ao editar uma parte, melhorar apenas o trecho relacionado.

## Sistema de Fontes

As únicas fontes permitidas são as definidas em:

```txt
css/variables.css
```

Fontes oficiais:

```css
--font-primary: "SF Pro";
--font-italic: "SF Pro Italic";
--font-title: "Tumb Test";
```

Regras obrigatórias:

- Nunca importar fontes novas.
- Nunca usar fontes diferentes.
- Evitar `font-family` hardcoded em código novo.
- Sempre reutilizar as variáveis existentes.

Uso esperado:

```css
font-family: var(--font-primary);
```

```css
font-family: var(--font-title);
```

Exemplo proibido:

```css
font-family: "Poppins";
```

## Onboarding

O onboarding deve ser uma única página:

```txt
onboarding.html
```

Não criar:

```txt
onboarding-1.html
onboarding-2.html
onboarding-3.html
onboarding-4.html
onboarding-5.html
```

Todas as etapas do onboarding devem ficar dentro de `onboarding.html`, separadas por `data-step`.

Exemplo:

```html
<main class="onboarding-page onboarding-page--intro" data-step="1">
```

A navegação entre etapas deve usar:

```html
data-go-to-step="2"
```

A lógica de troca entre etapas deve ficar em:

```txt
views/onboardingView.js
```

Não colocar script de onboarding diretamente dentro do HTML.

## CSS do Onboarding

Todo o CSS do onboarding deve ficar em:

```txt
css/pages/onboarding.css
```

Não criar:

```txt
onboarding-1.css
onboarding-2.css
onboarding-3.css
onboarding-4.css
onboarding-5.css
```

Usar a classe base:

```css
.onboarding-page
```

E modificadores por etapa:

```css
.onboarding-page--intro
.onboarding-page--create
.onboarding-page--quiz
.onboarding-page--vault
.onboarding-page--growth
```

Quando uma tela tiver estilo diferente, alterar apenas o modificador dela ou criar um novo modificador consistente.

## Historico

O histórico não faz parte do onboarding.

Regras:

- Não conectar o onboarding diretamente ao histórico.
- Não usar `href="./history.html"` dentro do onboarding, a menos que o usuário peça explicitamente.
- Não usar `href="./onboarding.html#step-4"` dentro do histórico.
- Não misturar conteúdo ou CSS de histórico dentro do onboarding.

## Componentes e Layout

Sempre:

- Mobile first.
- Spacing confortável.
- Alinhamento consistente.
- Visual respirando.
- Elementos organizados.
- Aparência amigável.
- Texto sem overflow.
- Imagens com tamanho controlado.

Evitar:

- Layouts apertados.
- Excesso de informação.
- Visual pesado.
- Desalinhamentos.
- Elementos estourando a tela.
- Texto cortado ou sobreposto.

## Botões

Todos os botões devem parecer parte do mesmo app.

Regras:

- Reutilizar classes existentes quando possível.
- Usar bordas arredondadas.
- Usar cores oficiais do `variables.css`.
- Manter boa área de toque em mobile.
- Usar transições suaves quando fizer sentido.
- Não criar botões visualmente desconectados do projeto.

No onboarding, reutilizar:

```css
.continue-button
.back-button
.skip-button
```

## Cards

Todos os cards devem:

- Manter o padrão visual do projeto.
- Ter aparência playful.
- Usar spacing confortável.
- Usar cores oficiais ou tokens adicionados ao `variables.css`.
- Parecer leves visualmente.

## Animações

Usar apenas:

- Transições suaves.
- Microinterações amigáveis.
- Feedback visual leve.

Evitar:

- Animações agressivas.
- Efeitos exagerados.
- Movimentos rápidos demais.
- Animações que atrapalhem leitura.

## HTML

Regras:

- Manter semântica.
- Manter organização limpa.
- Evitar duplicação.
- Usar estrutura consistente.
- Não colar export do Figma diretamente sem limpar.
- Não usar `style=""` em elementos.

## CSS

Regras:

- Reutilizar classes.
- Modularizar estilos por página.
- Evitar duplicação.
- Evitar `!important`.
- Usar variáveis do `variables.css`.
- Manter consistência visual.
- Não criar arquivos CSS paralelos para uma mesma feature.

## JavaScript

Regras:

- Manter código simples.
- Evitar duplicação.
- Criar funções pequenas e reutilizáveis.
- Colocar lógica visual/interativa em `views/`.
- Não colocar lógica inline no HTML.
- Não usar `history.replaceState`, `location.hash` ou `#step` para navegar no onboarding, salvo pedido explícito.

## Figma

Quando o usuário trouxer código ou medidas do Figma:

- Limpar o HTML antes de inserir no projeto.
- Remover `style=""`.
- Converter estilos para classes CSS.
- Reutilizar componentes e classes existentes.
- Transformar SVGs grandes em arquivos dentro de `assets/` quando melhorar a organização.
- Manter o tamanho mobile do projeto, especialmente telas de `402px` por `874px` quando o design pedir esse frame.
- Ajustar gaps e paddings no CSS, não no HTML.

## Antes de Criar Algo Novo

O Codex deve sempre:

1. Procurar componentes existentes.
2. Procurar classes CSS existentes.
3. Procurar variáveis em `css/variables.css`.
4. Reutilizar padrões atuais.
5. Manter o estilo colorful/playful.
6. Evitar duplicação de HTML, CSS e JS.
7. Fazer mudanças pequenas e focadas.

## Regra Principal

Se for uma etapa do onboarding, ela deve entrar em:

```txt
onboarding.html
```

Deve usar:

```txt
css/pages/onboarding.css
```

E qualquer interação deve ficar em:

```txt
views/onboardingView.js
```

O projeto inteiro deve sempre parecer um único app consistente, amigável, mobile first e visualmente acolhedor.
