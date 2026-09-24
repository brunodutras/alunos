const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");

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
