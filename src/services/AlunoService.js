const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");
const EmailDuplicadoError = require("../errors/EmailDuplicadoError");

const CAMPOS_ORDENAVEIS = ["id", "nome", "email"];
const DIRECOES_VALIDAS = ["asc", "desc"];

class AlunoService{

    async findMany(page, pageSize, orderBy, order){
        const campo = CAMPOS_ORDENAVEIS.includes(orderBy) ? orderBy : "id";
        const direcao = DIRECOES_VALIDAS.includes(order?.toLowerCase()) ? order.toLowerCase() : "asc";

        const [alunos, total] = await prisma.$transaction([
            prisma.aluno.findMany({
                skip: (page-1)*pageSize,
                take: Number(pageSize),
                orderBy: { [campo]: direcao }
            }),
            prisma.aluno.count()
        ]);

        return { alunos, total };
    }

    async findUnique(id){
        const idNumero = Number(id);

        if(!Number.isInteger(idNumero)){
            throw new AlunoNaoEncontradoError();
        }

        const aluno = await prisma.aluno.findUnique({
            where: { id: idNumero }
        });

        if(!aluno){
            throw new AlunoNaoEncontradoError();
        }

        return aluno;
    }

    async update(id, dados){
        const {nome, email} = dados ?? {};

        const data = {};
        if(nome !== undefined) data.nome = nome;
        if(email !== undefined) data.email = email;

        // Reaproveita AlunoInvalidoError: corpo vazio é o mesmo tipo de erro do create (dados inválidos, 400).
        if(Object.keys(data).length === 0){
            throw new AlunoInvalidoError("Informe ao menos nome ou email para atualizar");
        }

        if(data.nome === "" || data.email === ""){
            throw new AlunoInvalidoError("Nome e email não podem ser vazios");
        }

        // Reaproveita AlunoNaoEncontradoError através do findUnique.
        const aluno = await this.findUnique(id);

        try{
            return await prisma.aluno.update({
                where: { id: aluno.id },
                data
            });
        }catch(error){
            // Exceção própria (409): os dados são válidos, mas o email já pertence a outro aluno (@unique, código P2002).
            if(error.code === "P2002"){
                throw new EmailDuplicadoError();
            }
            throw error;
        }
    }

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }

        const novoAluno = await prisma.aluno.create({data: aluno});

        return novoAluno;
    }
}

module.exports = new AlunoService();
