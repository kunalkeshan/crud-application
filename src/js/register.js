const error = document.querySelector('.error');
const form = document.querySelector('form');


function cookieErrorStyles(){
    let cookies = document.cookie
    .split(';')
    .find(row => row.includes('userExists=false') || row.includes('userExists=true'))
    .split('=')[1];

    let check = (cookies === 'true');

    if(check) error.style.display = 'flex';
    else error.style.display = 'none';
}
cookieErrorStyles();

// form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const name = form.name.value;
//     const email = form.email.value;
//     const password = form.password.value;

//     try{
//         let res = await fetch('/register', {
//             method: 'POST',
//             body: JSON.stringify({name, email, password}), 
//             headers: {'Content-Type': 'application/json'}
//         });
//         let data = await res.json();
//         console.log(data);
//         if(data.name){
//             location.assign('/home');
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// })
