import { type Request, type Response } from "express";
import { Paciente } from "./paciente.entity.js";
import { AppDataSource } from "../data-source.js";
import { CPFValido } from "./validacaoCPF.js";
import { Consulta } from "../consultas/consulta.entity.js";
import { AppError, Status } from "../error/ErrorHandler.js";

export const criarPaciente = async (req: Request, res: Response): Promise<void> => {
  let {
    cpf,
    nome,
    email,
    senha,
    telefone,
    planoSaude,
  } = req.body;

  if (!CPFValido(cpf)) {
    throw new AppError("CPF Inválido!");
  }


  try {
    const paciente = new Paciente(
      cpf,
      nome,
      email,
      senha,
      telefone,
      planoSaude,
    );

    await AppDataSource.manager.save(Paciente, paciente);

    res.status(202).json(paciente);
  } catch (error) {
    res.status(502).json({ "Paciente não foi criado": error });
  }
};

export const lerPacientes = async (req: Request, res: Response): Promise<void> => {
  const tabelaPaciente = AppDataSource.getRepository(Paciente);
  const allPacientes = await tabelaPaciente.find();

  if (allPacientes.length === 0) {
    res.status(404).json("Não encontramos pacientes!");
  } else {
    res.status(200).json(allPacientes);
  }
};

export const lerPaciente = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const paciente = await AppDataSource.manager.findOne(Paciente, {
    where: { id },
  });

  if (paciente === null) {
    res.status(404).json("Paciente não encontrado!");
  } else {
    res.status(200).json(paciente);
  }
};

export const listaConsultasPaciente = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const paciente = await AppDataSource.manager.findOne(Paciente, {
    where: { id },
  });

  if (paciente == null) {
    throw new AppError("Paciente não encontrado!", Status.NOT_FOUND);
  }

  const consultas = await AppDataSource.manager.find(Consulta, {
    where: { paciente: { id: paciente.id } },
  });

  const consultadasTratadas = consultas.map((consulta) => {
    return {
      id: consulta.id,
      data: consulta.data,
      especialista: consulta.especialista,
    };
  });

  return res.json(consultadasTratadas);
};

// update
export const atualizarPaciente = async (req: Request, res: Response): Promise<void> => {
  let {
    nome,
    email,
    senha,
    telefone,
    planoSaude,
    cpf
  } = req.body;

  const { id } = req.params;

  if (!CPFValido(cpf)) {
    throw new AppError("CPF Inválido!", Status.BAD_REQUEST);
  }

  try {
    const paciente = await AppDataSource.manager.findOne(Paciente, {
      where: { id },
    });

    if (paciente === null) {
      res.status(404).json("Paciente não encontrado!");
    } else {
      paciente.cpf = cpf;
      paciente.nome = nome;
      paciente.email = email;
      paciente.telefone = telefone;
      paciente.planoSaude = planoSaude;

      await AppDataSource.manager.save(Paciente, paciente);
      res.status(200).json(paciente);
    }
  } catch (error) {
    res.status(502).json("Paciente não foi atualizado!");
  }
};

// Não deleta o paciente, fica inativo
export const desativaPaciente = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const paciente = await AppDataSource.manager.findOne(Paciente, {
    where: { id },
  });
};
