import mongoose, { Document, Schema } from 'mongoose';

export interface ITransacao {
  endToEndId: string;
  txid: string;
  valor: number;
  dataHoraTransacao: Date;
  tipoIniciacao: string;
}

export interface IPagador {
  cpf: string;
  nome: string;
  agencia: string;
  conta: string;
  instituicao: string;
  perfilRisco: string;
}

export interface IContaRecebedor {
  agencia: string;
  numero: string;
  dataAbertura: Date;
  scoreRiscoConta: number;
}

export interface IRecebedor {
  cpfCnpj: string;
  nome: string;
  chavePix: string;
  instituicao: string;
  conta: IContaRecebedor;
}

export interface IEvidenciaAnexada {
  tipo: string;
  url: string;
}

export interface IAvaliacaoFraude {
  motivoRelato: string;
  subtipoGolpe: string;
  descricaoUsuario: string;
  evidenciasAnexadas: IEvidenciaAnexada[];
}

export interface IDispositivoTransacao {
  idDispositivo: string;
  localizacaoIp: string;
  novoDispositivo: boolean;
}

export interface IMetadadosAnalise {
  relatosAnterioresRecebedor: number;
  valorMedioTransacoesRecebedor: number;
  historicoPagadorConsistente: boolean;
  dispositivoTransacao: IDispositivoTransacao;
}

export interface IRelatoInfracao extends Document {
  idRelato: string;
  dataHoraRelato: Date;
  statusRelato: string;
  transacao: ITransacao;
  pagador: IPagador;
  recebedor: IRecebedor;
  avaliacaoFraude: IAvaliacaoFraude;
  metadadosAnalise: IMetadadosAnalise;
  scoreAnalise?: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TransacaoSchema = new Schema<ITransacao>({
  endToEndId: { type: String, required: true },
  txid: { type: String, required: true },
  valor: { type: Number, required: true },
  dataHoraTransacao: { type: Date, required: true },
  tipoIniciacao: { type: String, required: true }
});

const PagadorSchema = new Schema<IPagador>({
  cpf: { type: String, required: true },
  nome: { type: String, required: true },
  agencia: { type: String, required: true },
  conta: { type: String, required: true },
  instituicao: { type: String, required: true },
  perfilRisco: { type: String, required: true }
});

const ContaRecebedorSchema = new Schema<IContaRecebedor>({
  agencia: { type: String, required: true },
  numero: { type: String, required: true },
  dataAbertura: { type: Date, required: true },
  scoreRiscoConta: { type: Number, required: true }
});

const RecebedorSchema = new Schema<IRecebedor>({
  cpfCnpj: { type: String, required: true },
  nome: { type: String, required: true },
  chavePix: { type: String, required: true },
  instituicao: { type: String, required: true },
  conta: { type: ContaRecebedorSchema, required: true }
});

const EvidenciaAnexadaSchema = new Schema<IEvidenciaAnexada>({
  tipo: { type: String, required: true },
  url: { type: String, required: true }
});

const AvaliacaoFraudeSchema = new Schema<IAvaliacaoFraude>({
  motivoRelato: { type: String, required: true },
  subtipoGolpe: { type: String, required: true },
  descricaoUsuario: { type: String, required: true },
  evidenciasAnexadas: [EvidenciaAnexadaSchema]
});

const DispositivoTransacaoSchema = new Schema<IDispositivoTransacao>({
  idDispositivo: { type: String, required: true },
  localizacaoIp: { type: String, required: true },
  novoDispositivo: { type: Boolean, required: true }
});

const MetadadosAnaliseSchema = new Schema<IMetadadosAnalise>({
  relatosAnterioresRecebedor: { type: Number, required: true },
  valorMedioTransacoesRecebedor: { type: Number, required: true },
  historicoPagadorConsistente: { type: Boolean, required: true },
  dispositivoTransacao: { type: DispositivoTransacaoSchema, required: true }
});

const RelatoInfracaoSchema = new Schema<IRelatoInfracao>({
  idRelato: { type: String, required: true, unique: true },
  dataHoraRelato: { type: Date, required: true },
  statusRelato: { type: String, required: true, default: 'EM_ANALISE' },
  transacao: { type: TransacaoSchema, required: true },
  pagador: { type: PagadorSchema, required: true },
  recebedor: { type: RecebedorSchema, required: true },
  avaliacaoFraude: { type: AvaliacaoFraudeSchema, required: true },
  metadadosAnalise: { type: MetadadosAnaliseSchema, required: true },
  scoreAnalise: { type: Number },
  dataCriacao: { type: Date, default: Date.now },
  dataAtualizacao: { type: Date, default: Date.now }
});

RelatoInfracaoSchema.pre('save', function(next) {
  this.dataAtualizacao = new Date();
  next();
});

export default mongoose.models.RelatoInfracao || mongoose.model<IRelatoInfracao>('RelatoInfracao', RelatoInfracaoSchema);
