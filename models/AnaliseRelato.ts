import mongoose, { Document, Schema } from 'mongoose';

export interface IAnaliseRelato extends Document {
  relatoId: mongoose.Types.ObjectId;
  score: number;
  nivelRisco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  bandeirasVermelhas: string[];
  recomendacoes: string[];
  justificativa: string;
  confianca: number;
  provider: 'gemini' | 'openai' | 'mock';
  modelo: string;
  dataAnalise: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const AnaliseRelatoSchema = new Schema<IAnaliseRelato>({
  relatoId: { 
    type: Schema.Types.ObjectId, 
    ref: 'RelatoInfracao', 
    required: true,
    index: true
  },
  score: { 
    type: Number, 
    required: true,
    min: 0
  },
  nivelRisco: { 
    type: String, 
    required: true,
    enum: ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO']
  },
  bandeirasVermelhas: [{
    type: String
  }],
  recomendacoes: [{
    type: String
  }],
  justificativa: { 
    type: String, 
    required: true
  },
  confianca: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  provider: { 
    type: String, 
    required: true,
    enum: ['gemini', 'openai', 'mock']
  },
  modelo: { 
    type: String, 
    required: true
  },
  dataAnalise: { 
    type: Date, 
    default: Date.now
  },
  dataCriacao: { 
    type: Date, 
    default: Date.now
  },
  dataAtualizacao: { 
    type: Date, 
    default: Date.now
  }
});

AnaliseRelatoSchema.pre('save', function(next) {
  this.dataAtualizacao = new Date();
  next();
});

// Índices para melhor performance
AnaliseRelatoSchema.index({ relatoId: 1, dataAnalise: -1 });
AnaliseRelatoSchema.index({ nivelRisco: 1 });
AnaliseRelatoSchema.index({ score: -1 });

export default mongoose.models.AnaliseRelato || mongoose.model<IAnaliseRelato>('AnaliseRelato', AnaliseRelatoSchema);
