let searchResponse = document.getElementById("searchResponse");
document.getElementById('save').addEventListener('click', search);
document.getElementById('save').addEventListener('click', search);
document.querySelector('#chemical').addEventListener('keypress', function (e) {if (e.key === 'Enter') {search()}});
let structureData = document.getElementById("structureData")

function draw(SMILES){
    let smilesDrawer = new SmilesDrawer.Drawer({ width: 250, height: 250 });
    SmilesDrawer.parse(SMILES, function (tree) {
        smilesDrawer.draw(tree, 'example-canvas', 'light', false);
    }, function (err) {
        console.log(err);
    });
}


function search(){
    chem = document.getElementById('chemical').value;
    console.log(chem)
    const data_url="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/"+chem+"/JSON";
    getInchi(data_url,chem);
}

async function getInchi(data_url,chem){

    searchResponse.innerHTML = "";
    structureData.innerHTML ="";

    const response = await fetch(data_url);
    const data = await response.json();
    if (data.Fault){
        searchResponse.innerHTML = "No chemical found with that name";
        searchResponse.setAttribute("style","color:red");
    }
    else{
    

    searchResponse.setAttribute("style","color:black");
    let arr=[];
    let dic=["IUPAC","InChI","MW","Formula","SMILES"];
    arr.push(data.PC_Compounds[0].props[9].value.sval);
    arr.push(data.PC_Compounds[0].props[12].value.sval);
    arr.push(data.PC_Compounds[0].props[17].value.sval + " g/mol");
    arr.push(data.PC_Compounds[0].props[16].value.sval);
    arr.push(data.PC_Compounds[0].props[18].value.sval);

    getMolData(data.PC_Compounds[0].props[9].value.sval);
    draw(arr.slice(-1)[0]);

    const specs = document.createElement("ul");
    specs.setAttribute("style","color:black");

    for (let i=0;i<arr.length;i++) {
        const key = document.createElement("li");
        key.innerHTML = dic[i] + ": " + arr[i];
        specs.appendChild(key);
    }
    specs.setAttribute('class',"container-fluid");
    structureData.appendChild(specs);
}};

class molecule{
    constructor(name) {
        this.name = name;
        this.atoms = new Map();
        this.bonds = new Map();
        this.atoms_ex_H = new Map();
        this.bonds_ex_H = new Map();
      }

    get getTotalM(){
        
    } 
}

async function getMolData(IUPAC){  
    url="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/"+IUPAC+"/sdf";
    const response = await fetch(url);
    const data = await response.text();

    const mol = new molecule(IUPAC);
    let arr = data.split("\n");
    let atom_count = parseInt(arr[3].substring(0,3));
    let bonds_count = parseInt(arr[3].substring(3,6));

    console.log(atom_count,bonds_count);

    var c=1; var h=1;
    for (let i=4;i<(4+atom_count);i++){
        currAtom = arr[i].substring(31,33).trim();
        mol.atoms[c]=currAtom;
        if (currAtom !== "H"){
            mol.atoms_ex_H[h]=currAtom;
            h++;
        }
        c++;    
    }
    var c=1; var h=1;
    for (let i=4+atom_count;i<(4+atom_count+bonds_count);i++){
        atom1 = parseInt(arr[i].substring(0,3).trim());
        atom2 = parseInt(arr[i].substring(3,6).trim());
        type = parseInt(arr[i].substring(6,9).trim());
        mol.bonds[c]={atom1,atom2,type};
        if (mol.atoms[atom1]!=="H" && mol.atoms[atom2]!=="H"){
            mol.bonds_ex_H[h]={atom1,atom2,type};
            h++;
        }
        c++;   
    }
    console.log(mol.bonds,mol.atoms);
    console.log(mol.bonds_ex_H,mol.atoms_ex_H);
}