var textarea = document.getElementById('text');
let result = document.getElementById('result');
var select = document.getElementById('select');
textarea.addEventListener('input',()=>{
    make_result();
});
select.addEventListener('change',()=>{
    make_result();
})
function make_result(){
    if(select.value == 'encode'){
        result.value = window.atob(textarea.value);
    }else{
        result.value = window.btoa(textarea.value);

    }
}

var night = document.getElementById('img-1');
var moon = document.getElementById('img-2');
var nav = document.getElementById('nav');
var card= document.getElementById('card');
var p1 = document.getElementById('p1');
var p2 = document.getElementById('p2');
var namee = document.getElementById('a');
night.onclick = ()=>{
    document.body.style.background = `    #444  
    `;
nav.style.background = '#777';
card.style.background = '#555';
card.style.color = '#fff';
namee.style.color = '#fff';

textarea.style.background = '#666';
result.style.background = '#666';
colorp.style.color = '#fff';
colorpp.style.color = '#fff';

textarea.style.color = 'white';
result.style.color = 'white';
p1.style.background = '#777';
p2.style.background = '#777';
select.style.background = '#666';
select.style.color = 'white';
card_text.style.background = ' #666';
card_text.style.color = ' #fff';

}
var card_text = document.getElementById('cardd')
var colorp = document.getElementById('col');
var colorpp = document.getElementById('coll')
moon.onclick = ()=>{
    document.body.style.background = '#fff';
nav.style.background = '#f0f0f0';
nav.style.color = '#black';
colorpp.style.color = 'black';

colorp.style.color = 'black';
namee.style.color = 'black';

card.style.background = 'rgba(0,0,0,.03)';
card_text.style.background = ' #fff';

textarea.style.background = '#fff';
result.style.background = '#fff';
textarea.style.color = '#fff';
result.style.color = '#fff';
p1.style.background = 'rgb(76, 87, 240)';
p2.style.background = 'rgb(76, 87, 240)';
select.style.background = '#fff';
select.style.color = '#111'

}