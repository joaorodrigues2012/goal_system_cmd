const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require("fs").promises

let metas = []
let mensagem = "Bem vindo ao App de Metas"

const carregarMetas = async () => {
  try{
    const dados = await fs.readFile("metas.json", "utf-8")
    metas = JSON.parse(dados)
  }catch(e){
    metas = []
  }
}

const saveMetas = async () => {
  await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const createMeta = async () => {
  const meta = await input({message: "Digite a meta:"})

  if(meta.length == 0){
    mensagem = "A meta não pode ser vazia."
    return
  }

  metas.push({
    value: meta,
    checked: false
  });

  mensagem = "Meta cadastrada com sucesso!"
}

const getMetas = async () => {

  if(metas.length == 0){
    mensagem = "Você não tem metas cadastradas"
    return
  }

  const response = await checkbox({
    message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa",
    choices: [...metas],
    instructions: false
  })

  metas.forEach((m) => {
    m.checked = false
  })

  if(response.length == 0){
    mensagem = "Nenhuma meta selecionada!"
    return
  }

  response.forEach((resp) => {
    const meta = metas.find((m) => {
      return m.value == resp
    })

    meta.checked = true
  })

  mensagem = "Meta(s) marcada(s) como concluídas(s)"
}

const achievedMetas = async () => {
  
  if(metas.length == 0){
    mensagem = "Você não tem metas cadastradas"
    return
  }
  
  const achieved = metas.filter((meta) => {
    return meta.checked
  })

  if(achieved.length == 0){
    mensagem = "Não existem metas realizadas!"
    return
  }

  await select({
    message: "Metas Realizadas " + achieved.length,
    choices: [...achieved]
  })
}

const openMetas = async () => {
  if(metas.length == 0){
    mensagem = "Você não tem metas cadastradas"
    return
  }

  const open = metas.filter((meta) => {
    return !meta.checked
  })

  if(open.length == 0){
    mensagem = "Não existem metas abertas!"
    return
  }

  await select({
    message: "Metas Abertas " + open.length,
    choices: [...open]
  })
}

const removeMetas = async () => {

  if(metas.length == 0){
    mensagem = "Você não tem metas cadastradas"
    return
  }

  const metasDesmarcadas = metas.map((meta) => {
    return {value: meta.value, checked: false}
  })

  const itemsDeletar = await checkbox({
    message: "Selecione item para deletar",
    choices: [...metasDesmarcadas],
    instructions: false
  })

  if(itemsDeletar.length == 0){
    mensagem = 'Nenhum item selecionado!';
    return
  }

  itemsDeletar.forEach((item) => {
    metas = metas.filter(() => {
      return meta.value != item
    })
  })

  mensagem = "Meta(s) deletada(s) com sucesso!";
}

const mostrarMesagem = () => {
  console.clear();

  if(mensagem != ""){
    console.log(mensagem);
    console.log("")
    mensagem = ""
  }
}

const start = async () => {

  await carregarMetas()
  await saveMetas()

  while(true){
    mostrarMesagem()
    const option = await select({
      message: "Menu >",
      choices: [
        {
          name: "Cadastrar meta",
          value: "create"
        },
        {
          name: "Listar metas",
          value: "get"
        },
        {
          name: "Metas realizadas",
          value: "achieved"
        },
        {
          name: "Metas abertas",
          value: "open"
        },
        {
          name: "Remover metas",
          value: "remove"
        },
        {
          name: "Sair",
          value: "exit"
        }
      ]
    });

    switch (option) {
      case 'create':
        await createMeta();
        break;
      case 'get':
        await getMetas();
        break;
      case 'achieved':
        await achievedMetas();
        break;
      case 'open':
        await openMetas();
        break;
      case 'remove':
        await removeMetas();
        break;
      case 'exit':
        console.log("Até a próxima!")
        return
    }

  }

}

start();