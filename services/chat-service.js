// Respostas locais — nenhuma chamada de rede, nenhuma chave de API.
// Seguem as regras do sistema Reflect: perguntas abertas, 2 frases max,
// português europeu, sem conselhos clínicos.
const MOCK_REPLIES = [
  "Faz sentido que isso pese. O que é que te faz continuar a pensar nisso?",
  "Parece que há algo importante por explorar aqui. Como é que isso te afeta no dia a dia?",
  "É natural que isso ocupe espaço na tua cabeça. O que aconteceria se deixasses de resistir a esse pensamento?",
  "Estou a ouvir. Quando foi a primeira vez que te sentiste assim em relação a isto?",
  "Isso soa difícil de carregar. O que é que tu precisarias para te sentires um pouco mais leve?",
  "É interessante o que partilhaste. De que forma é que isso influencia as tuas escolhas?",
  "Obrigado por partilhares. O que é que esta preocupação te está a tentar dizer?",
  "Faz sentido que seja complicado. O que mudaria para ti se isto se resolvesse?",
  "Compreendo. Como é que o teu corpo reage quando pensas nisso?",
  "É válido o que sentes. O que é que seria diferente se olhasses para isto daqui a um ano?",
  "Tens coragem em explorar isto. O que é que te ajuda a manter-te equilibrado quando isso surge?",
  "Parece que tens estado a refletir muito. O que é que ainda não conseguiste dizer em voz alta sobre isto?",
];

let replyIndex = 0;

function pickReply() {
  const reply = MOCK_REPLIES[replyIndex % MOCK_REPLIES.length];
  replyIndex += 1;
  return reply;
}

// Simula streaming: entrega o texto caracter a caracter com um pequeno delay.
function streamLocally(text, onDelta) {
  return new Promise((resolve) => {
    const CHAR_DELAY_MS = 18;
    let i = 0;

    function tick() {
      if (i >= text.length) {
        resolve(text);
        return;
      }
      onDelta(text[i]);
      i += 1;
      setTimeout(tick, CHAR_DELAY_MS);
    }

    // Pequeno delay inicial para simular "a pensar"
    setTimeout(tick, 600);
  });
}

export async function sendMessage(_messages) {
  await new Promise((r) => setTimeout(r, 900));
  return pickReply();
}

export async function streamMessage(_messages, onDelta) {
  const reply = pickReply();
  return streamLocally(reply, onDelta);
}

