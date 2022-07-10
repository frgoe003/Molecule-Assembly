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
    getInchi(data_url);
}

async function getInchi(data_url){

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
    console.log(data);
    let arr=[];
    let dic=["IUPAC","InChI","MW","Formula","SMILES"];
    arr.push(data.PC_Compounds[0].props[9].value.sval);
    arr.push(data.PC_Compounds[0].props[12].value.sval);
    arr.push(data.PC_Compounds[0].props[17].value.sval + " g/mol");
    arr.push(data.PC_Compounds[0].props[16].value.sval);
    arr.push(data.PC_Compounds[0].props[18].value.sval);

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

