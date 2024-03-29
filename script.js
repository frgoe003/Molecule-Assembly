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


async function getMolData(IUPAC){  
    url="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/"+IUPAC+"/sdf";
    const response = await fetch(url);
    const data = await response.text();

    const mol = new molecule(IUPAC);
    let arr = data.split("\n");
    let atom_count = parseInt(arr[3].substring(0,3));
    let bonds_count = parseInt(arr[3].substring(3,6));

    var c=1; var h=1;
    for (let i=4;i<(4+atom_count);i++){
        symbol = arr[i].substring(31,33).trim();
        let currAtom = new atom(c);
        currAtom.symbol = symbol;
        mol.atoms.set(c,currAtom);
        
        if (currAtom.symbol !== "H"){
            mol.atoms_ex_H.set(h,currAtom);
            h++;
        }
        c++;    
    }
    var c=1; var h=1;
    for (let i=4+atom_count;i<(4+atom_count+bonds_count);i++){

        let atom1 = mol.atoms.get(parseInt(arr[i].substring(0,3).trim()));
        let atom2 = mol.atoms.get(parseInt(arr[i].substring(3,6).trim()));

        type = parseInt(arr[i].substring(6,9).trim());
        currBond = new bond(atom1,atom2,type);
        mol.bonds.set(c,{atom1,atom2,type,currBond});

        if (mol.atoms.get(atom1.symbol)!=="H" && mol.atoms.get(atom2.symbol)!=="H"){
            mol.bonds_ex_H.set(h,{atom1,atom2,type,currBond});
            h++;
        }
        atom1.bondedTo.push(atom2);
        atom2.bondedTo.push(atom1);
        c++;   
    }
    for (const key of mol.atoms.keys()){
        currAtom = mol.atoms.get(key);
        if (currAtom.bondedTo.length>1){
            mol.atomsHub.push(currAtom);   // OPEN ?! check if H-Bonds are to be included 
        }
    }
    console.log(mol.atoms);
    let res = getToCut(mol.atoms.get(1));
    console.log(res);
    console.log(mol.atomsHub);
    console.log(mol.getTotalM());
}


// fragmentation
function fragment(molecule){
    for (let i=0; i<molecule.atomsHub.length;i++){
        currAtom = molecule.atomsHub[i];
        
    }
}



















class atom{
    constructor(id){
        this.id = id;
        this.symbol = new String();
        this.bondedTo = new Array();
        this.toCut = new Array();
    }
}
class bond{
    constructor(atom1,atom2,type){
        this.type = type;
        this.atom1 = atom1;
        this.atom2 = atom2;
    }
}

class molecule{
    constructor(name) {
        this.name = name;
        this.atoms = new Map();
        this.bonds = new Map();
        this.atoms_ex_H = new Map();
        this.bonds_ex_H = new Map();

        this.atomsHub = new Array();
      }

    getTotalM(){
        let M = 1;
        for (let i=0;i<this.atomsHub.length;i++){
            currAtom = this.atomsHub[i];
            M *= getToCutInt[currAtom.bondedTo.length];
        }
        return M;
    } 
}


/* =========================================== */
const getToCutInt=[1,2,5,15,52,0]; //Possibilities to split n bonds, n=6-1 -> default

function getToCut(currAtom) {

    let bonds = currAtom.bondedTo;
    n = bonds.length;

    console.log("number of bonds: "+n);

	switch (n) {
	case 2:
		a = bonds[0];
		b = bonds[1];
		return ( // = 2 ways
			[
            [a,b],
            [[a],[b]]
        ]
        );
	case 3:
		a = bonds[0];
		b = bonds[1];
		c = bonds[2];
		return (
            [
            [a,b,c],
            [[a],[b,c]], [[b],[a,c]], [[c],[a,b]],
            [[a],[b],[c]]
        ]
        );
	case 4:
		a = bonds[0];
		b = bonds[1];
		c = bonds[2];
		d = bonds[3];
		return (
            [
            [a,b,c,d],
            [[a],[b,c,d]], [[b],[a,c,d]], [[c],[a,b,d]], [[d],[a,b,c]],
            [[a,b],[c,d]], [[b,c],[a,d]], [[a,c],[b,d]], 
            [[a],[b],[c,d]], [[a],[b],[c,d]],[[a],[b],[c,d]],[[a],[b],[c,d]],[[a],[b],[c,d]],[[a],[b],[c,d]],
            [[a],[b],[c],[d]]
        ]
        );
	case 5:
		a = bonds[0];
		b = bonds[1];
		c = bonds[2];
		d = bonds[3];
		e = bonds[4];
        return (
            [
            [a,b,c,d,e],
            [[a],[b,c,d,e]], [[b],[a,c,d,e]], [[c],[a,b,d,e]], [[d],[a,b,c,e]], [[e],[a,b,c,d]],
            [[a,b],[c,d,e]], [[a,c],[b,d,e]], [[a,d],[b,c,e]], [[a,e],[b,c,d]],[[b,c],[a,d,e]], [[b,d],[a,c,e]], [[b,e],[a,c,d]], [[c,d],[a,b,e]],[[c,e],[a,b,d]], [[d,e],[a,b,c]],
            [[a],[b],[c,d,e]], [[a],[c],[b,d,e]],[[a],[d],[b,c,e]],[[a],[e],[b,c,d]],[[b],[c],[a,d,e]],[[d],[b],[a,c,e]],[[e],[b],[a,c,d]],[[c],[d],[a,b,e]],[[c],[e],[a,b,d]],[[d],[e],[a,b,c]],
            [[e],[a,b],[c,d]],[[d],[a,b],[c,e]],[[c],[a,b],[d,e]],[[e],[a,c],[b,d]],[[d],[a,c],[b,e]],[[b],[a,c],[d,e]],[[e],[a,d],[b,c]],[[c],[a,d],[b,e]],[[b],[a,d],[c,e]],[[d],[a,e],[b,c]],[[c],[a,e],[b,d]],[[b],[a,e],[c,d]],[[a],[b,c],[d,e]],[[a],[b,d],[c,e]],[[a],[b,e],[c,d]],
            [[a],[b],[c],[d,e]],[[a],[b],[d],[c,e]],[[a],[b],[e],[d,c]],[[a],[d],[c],[b,e]],[[a],[c],[e],[d,b]],[[a],[d],[e],[b,c]],[[c],[b],[d],[a,e]],[[b],[c],[e],[d,a]],[[e],[b],[d],[a,c]],[[c],[d],[e],[a,b]],
            [[a],[b],[c],[d],[e]]
        ]
        );
	case 1:
		return [];
	default:
		throw "Error";
	}
}