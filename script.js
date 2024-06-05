const modal = document.querySelector('.modal-container');
const modal2 = document.querySelector('.modal-container-falta');
const tbody = document.querySelector('tbody');
const tbody2 = document.querySelector('.tb');
const sFoto = document.querySelector('#m-foto');
const sNome = document.querySelector('#m-nome');
const sFuncao = document.querySelector('#m-funcao');
const sTelefone = document.querySelector('#m-telefone');
const sEmail = document.querySelector('#m-email');
const sFaltas = document.querySelector('#m-faltas');
const btnSalvar = document.querySelector('#btnSalvar');
const btnSalvarFalta = document.querySelector('#btnSalvarFalta');

let itens = [];
let id;

// Função para abrir o modal de edição ou criação
function openModal(edit = false, index = 0) {
  modal.classList.add('active');

  modal.onclick = e => {
    if (e.target.className.indexOf('modal-container') !== -1) {
      modal.classList.remove('active');
    }
  };

  modal2.innerHTML = '';

  if (edit) {
    const item = itens[index];
    sNome.value = item.nome;
    sFuncao.value = item.funcao;
    sTelefone.value = item.telefone;
    sEmail.value = item.email;
    sFaltas.value = item.faltas;
    sFoto.dataset.index = index;
    id = index;
  } else {
    clearModalFields();
    id = undefined;
  }
}

// Adiciona um listener para o evento input
sTelefone.addEventListener('input', function(event) {
  const input = event.target;
  const inputValue = input.value.replace(/\D/g, ''); // Remove todos os caracteres que não são dígitos
  const formattedValue = formatarTelefone(inputValue);
  input.value = formattedValue;
});

// Função para formatar o número de telefone
function formatarTelefone(numero) {
  const match = numero.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (match) {
      const formattedNumero = '(' + match[1] + ') ' + match[2] + (match[3] ? '-' + match[3] : '');
      return formattedNumero.trim(); // Remove espaços em branco extras
  }
  return numero;
}

// Função para abrir o modal de falta
function openModal2() {
  modal2.classList.add('active');

  modal2.onclick = e => {
    if (e.target.className.indexOf('modal-container') !== -1) {
      modal2.classList.remove('active');
    }
  };
  loadItens2();
}

// Função para editar um item
function editItem(index) {
  openModal(true, index);
}

// Função para deletar um item
function deleteItem(index) {
  itens.splice(index, 1);
  setItensBD();
  loadItens();
}

// Função para inserir um item na tabela principal
function insertItem(item, index) {
  let tr = document.createElement('tr');

  tr.innerHTML = `
    <td><img src="${item.foto}" alt="Foto de ${item.nome}" style="width: 100px; height: 100px; object-fit: cover;"></td>
    <td>${item.nome}</td>
    <td>${item.funcao}</td>
    <td>${item.telefone}</td>
    <td>${item.email}</td>
    <td>${item.faltas}</td>
    <td class="acao">
      <button onclick="editItem(${index})"><i class='bx bx-edit'></i></button>
    </td>
    <td class="acao">
      <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;
  tbody.appendChild(tr);
}

// Função para inserir um item na tabela de faltas
function insertItem2(item, index) {
  let tr = document.createElement('tr');

  tr.innerHTML = `
    <td><img src="${item.foto}" alt="Foto de ${item.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
    <td>${item.nome}</td>
    <td id="faltas-${index}">${item.faltas}</td>
    <td class="acao">
      <label for="faul-${index}">F</label>
      <input type="checkbox" id="faul-${index}" name="falta">
    </td>
  `;
  tbody2.appendChild(tr);
}

// Evento de clique para salvar faltas
btnSalvarFalta.addEventListener('click', () => {
  itens.forEach((item, index) => {
    const faltaCheckbox = document.getElementById(`faul-${index}`);
    
    if (faltaCheckbox && faltaCheckbox.checked) {
      item.faltas = parseInt(item.faltas, 10) + 1;
      document.getElementById(`faltas-${index}`).textContent = item.faltas;
      faltaCheckbox.checked = false;  // Desmarca o checkbox após salvar
      setItensBD();  // Salva os itens atualizados
    }
  });
  loadItens(); 
  loadItens2();
  modal2.classList.remove('active');
});

// Evento de clique para salvar o formulário de edição/criação
btnSalvar.onclick = e => {
  e.preventDefault();

  if (areFieldsValid()) {
    const file = sFoto.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imageUrl = e.target.result;
        saveItem(imageUrl);
      };
      reader.readAsDataURL(file);
    } else {
      saveItem();
    }
  }
};

// Função para verificar se os campos estão preenchidos
function areFieldsValid() {
  return sNome.value !== '' && sFuncao.value !== '' && sTelefone.value !== '' && sEmail.value !== '' && sFaltas.value !== '';
}

// Função para limpar os campos do modal
function clearModalFields() {
  sFoto.value = '';
  sNome.value = '';
  sFuncao.value = '';
  sTelefone.value = '';
  sEmail.value = '';
  sFaltas.value = 0;
}

// Função para salvar um item (criação ou edição)
function saveItem(imageUrl = '') {
  if (id !== undefined) {
    updateItem(imageUrl);
  } else {
    createNewItem(imageUrl);
  }
  setItensBD();
  modal.classList.remove('active');
  loadItens();
  id = undefined;
}

// Função para atualizar um item existente
function updateItem(imageUrl) {
  if (imageUrl) {
    itens[id].foto = imageUrl;
  }
  itens[id].nome = sNome.value;
  itens[id].funcao = sFuncao.value;
  itens[id].telefone = sTelefone.value;
  itens[id].email = sEmail.value;
  itens[id].faltas = sFaltas.value;
}

// Função para criar um novo item
function createNewItem(imageUrl) {
  itens.push({ 'foto': imageUrl, 'nome': sNome.value, 'funcao': sFuncao.value, 'telefone': sTelefone.value, 'email': sEmail.value, 'faltas': sFaltas.value });
}

// Função para carregar os itens na tabela principal
function loadItens() {
  itens = getItensBD();
  tbody.innerHTML = '';
  itens.forEach((item, index) => {
    insertItem(item, index);
  });
}

// Função para carregar os itens na tabela de faltas
function loadItens2() {
  itens = getItensBD();
  tbody2.innerHTML = '';
  itens.forEach((item, index) => {
    insertItem2(item, index);
  });
}

// Funções para manipular o local storage
const getItensBD = () => JSON.parse(localStorage.getItem('dbfunc')) ?? [];
const setItensBD = () => localStorage.setItem('dbfunc', JSON.stringify(itens));

// Inicializa a tabela principal
loadItens();
