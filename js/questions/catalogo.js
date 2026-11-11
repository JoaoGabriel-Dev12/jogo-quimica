import { defineQuestion } from "./schema.js";
import { fase3 } from "./fase3.js";
import { fase4 } from "./fase4.js";

function modelo({ id, fase, enunciado, resposta, aliases = [], formato = "texto" }) {
  return defineQuestion({
    id,
    fase,
    gerar(rng) {
      return { enunciado, resposta, aliases, formato, params: { variante: Math.floor(rng() * 1_000_000) } };
    },
  });
}

export const catalogo = [
  modelo({ id: "fase1-octeto-01", fase: 1, enunciado: "O carbono tem número atômico Z = ___", resposta: "6", aliases: ["seis"], formato: "lacuna" }),
  modelo({ id: "fase1-carbono-02", fase: 1, enunciado: "Qual é o símbolo químico do carbono?", resposta: "C", aliases: ["carbono"] }),
  modelo({ id: "fase2-tetravalencia-01", fase: 2, enunciado: "O carbono é tetravalente? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase2-ligacoes-02", fase: 2, enunciado: "Quantas ligações o carbono pode formar?", resposta: "4", aliases: ["quatro"] }),
  ...fase3,
  ...fase4,
  modelo({ id: "fase5-metano-01", fase: 5, enunciado: "O nome CH₄ é metano? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase5-etano-02", fase: 5, enunciado: "O prefixo et- indica dois carbonos? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase6-cadeia-01", fase: 6, enunciado: "Isômeros planos têm a mesma fórmula molecular? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase6-butano-02", fase: 6, enunciado: "Butano e isobutano são isômeros? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase7-cis-trans-01", fase: 7, enunciado: "Cis e trans são formas de isomeria espacial? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase7-quiral-02", fase: 7, enunciado: "Um carbono quiral pode ter quatro ligantes diferentes? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase8-adicao-01", fase: 8, enunciado: "Reações de adição podem ocorrer em ligações duplas? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase8-combustao-02", fase: 8, enunciado: "A combustão completa produz CO₂? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase9-monomero-01", fase: 9, enunciado: "Polímeros são formados por unidades repetidas? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase9-polietileno-02", fase: 9, enunciado: "O polietileno é um polímero? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase10-aminoacido-01", fase: 10, enunciado: "Aminoácidos participam da formação de proteínas? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase10-glicose-02", fase: 10, enunciado: "A glicose é uma molécula orgânica? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase11-revisao-01", fase: 11, enunciado: "O carbono é essencial à química orgânica? (sim/não)", resposta: "sim", aliases: ["s"] }),
  modelo({ id: "fase11-revisao-02", fase: 11, enunciado: "Uma ligação simples é representada por um traço? (sim/não)", resposta: "sim", aliases: ["s"] }),
];
