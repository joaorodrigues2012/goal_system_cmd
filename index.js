const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require("fs").promises

let metas = []
let mensagem = "Bem-vindo ao App de Metas"

// Função para carregar metas de um arquivo JSON
const carregarMetas = async () => {
  try{
    const dados = await fs.readFile("metas.json", "utf-8")
    metas = JSON.parse(dados)
  }catch(e){
    metas = []
  }
}

// Função para salvar metas em um arquivo JSON
const saveMetas = async () => {
  try {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2));
  } catch (e) {
    mensagem = "Erro ao salvar metas!";
  }
}

// Função para verificar se existem metas cadastradas
const verificarMetas = () => {
  if (metas.length === 0) {
    mensagem = "Você não tem metas cadastradas.";
    return false;
  }
  return true;
};

// Função para criar uma nova meta
const createMeta = async () => {
  const meta = await input({message: "Digite a meta:"})

  if(meta.trim().length === 0){
    mensagem = "A meta não pode ser vazia."
    return
  }

  metas.push({
    value: meta,
    checked: false
  });

  mensagem = "Meta cadastrada com sucesso!"
}

// Função para listar e marcar metas
const getMetas = async () => {

  if (!verificarMetas()) return;

  const response = await checkbox({
    message: "Use as setas para navegar, o espaço para marcar/desmarcar e o Enter para finalizar.",
    choices: metas.map((meta) => ({ name: meta.value, value: meta.value, checked: meta.checked })),
    instructions: false
  })

  metas.forEach((m) => {
    m.checked = false
  })

  if (response.length === 0) {
    mensagem = "Nenhuma meta selecionada!";
    return;
  }

  metas.forEach((meta) => {
    meta.checked = response.includes(meta.value);
  });

  mensagem = "Meta(s) marcada(s) como concluída(s)."
}

// Função para exibir metas concluídas
const achievedMetas = async () => {
  
  if (!verificarMetas()) return;
  
  const achieved = metas.filter((meta) => meta.checked);

  if (achieved.length === 0) {
    mensagem = "Não existem metas realizadas!";
    return;
  }

  await select({
    message: `Metas Realizadas (${achieved.length})`,
    choices: achieved.map((meta) => ({ name: meta.value, value: meta.value })),
  })
}

// Função para exibir metas abertas
const openMetas = async () => {
  if (!verificarMetas()) return;

  const open = metas.filter((meta) => !meta.checked);

  if (open.length === 0) {
    mensagem = "Não existem metas abertas!";
    return;
  }

  await select({
    message: `Metas Abertas (${open.length})`,
    choices: open.map((meta) => ({ name: meta.value, value: meta.value })),
  })
}

// Função para remover metas selecionadas
const removeMetas = async () => {

  if (!verificarMetas()) return;

  const itemsDeletar = await checkbox({
    message: "Selecione as metas para deletar",
    choices: metas.map((meta) => ({ name: meta.value, value: meta.value })),
    instructions: false
  })

  if (itemsDeletar.length === 0) {
    mensagem = "Nenhuma meta selecionada!";
    return;
  }

  metas = metas.filter((meta) => !itemsDeletar.includes(meta.value));
  mensagem = "Meta(s) deletada(s) com sucesso!";
}

// Função para exibir a mensagem de status
const mostrarMensagem = () => {
  console.clear();

  if(mensagem != ""){
    console.log(mensagem);
    console.log("")
    mensagem = ""
  }
}

const exibirMenu = async () => {
  return await select({
    message: "Menu >",
    choices: [
      { name: "Cadastrar meta", value: "create" },
      { name: "Listar metas", value: "get" },
      { name: "Metas realizadas", value: "achieved" },
      { name: "Metas abertas", value: "open" },
      { name: "Remover metas", value: "remove" },
      { name: "Sair", value: "exit" }
    ]
  });
};

// Função principal para iniciar o programa
const start = async () => {

  await carregarMetas()

  while(true){
    mostrarMensagem()
    const option = await exibirMenu()

    switch (option) {
      case 'create':
        await createMeta();
        await saveMetas()
        break;
      case 'get':
        await getMetas();
        await saveMetas()
        break;
      case 'achieved':
        await achievedMetas();
        break;
      case 'open':
        await openMetas();
        break;
      case 'remove':
        await removeMetas();
        await saveMetas()
        break;
      case 'exit':
        console.log("Até a próxima!")
        return
    }

  }

}

start();