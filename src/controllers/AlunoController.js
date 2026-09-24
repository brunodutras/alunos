const alunoService = require("../services/AlunoService");

function responderErro(response, error){
    if(error.statusCode){
        return response.status(error.statusCode).json({error: error.message});
    }
    return response.status(500).json({error: "Erro interno do servidor"});
}

class AlunoController{

    async findMany(request, response){
        try{
            let {page, pageSize, orderBy, order} = request.query;
            page ||= 1;
            pageSize ||= 10;

            const {alunos, total} = await alunoService.findMany(page, pageSize, orderBy, order);
            return response.status(200).json({alunos, total});
        }catch(error){
            return responderErro(response, error);
        }
    }

    async create(request, response){
        try{
            const aluno = await alunoService.create(request.body);
            return response.status(201).json({aluno});
        }catch(error){
            return response.status(400).json({error: error.message});
        }
    }

}

module.exports = new AlunoController();
