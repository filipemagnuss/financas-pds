-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('RECEITA', 'DESPESA', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaBancaria" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "saldo_atual" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ContaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartaoCredito" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "limite_total" DECIMAL(10,2) NOT NULL,
    "dia_fechamento" INTEGER NOT NULL,
    "dia_vencimento" INTEGER NOT NULL,

    CONSTRAINT "CartaoCredito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "conta_id" TEXT,
    "cartao_id" TEXT,
    "categoria_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_transacao" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "is_recorrente" BOOLEAN NOT NULL DEFAULT false,
    "parcela_atual" INTEGER,
    "total_parcelas" INTEGER,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "ContaBancaria" ADD CONSTRAINT "ContaBancaria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoCredito" ADD CONSTRAINT "CartaoCredito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "ContaBancaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_cartao_id_fkey" FOREIGN KEY ("cartao_id") REFERENCES "CartaoCredito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
