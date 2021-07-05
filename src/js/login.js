const error = document.querySelector('.error');

function cookieErrorStyles(){
    let cookies = document.cookie
    .split(';')
    .find(row => (row.includes('checkUser=false') || row.includes('checkUser=true')))
    .split('=')[1];

    let check = (cookies === 'true');

    if(check) error.style.display = 'flex';
    else error.style.display = 'none';
}
cookieErrorStyles();
