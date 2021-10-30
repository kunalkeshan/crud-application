const getUser = () => {
    const cookies = document.cookie;
    const userRegEx = /userDetails/
    let user = cookies.split(";")
    user = user.filter((ele) => {
        return userRegEx.test(ele)
    })
    user = user[0].split("=")[1];
    user = JSON.parse(decodeURIComponent(user))
    return user.name;
}
const userContainer = document.getElementById("user");
userContainer.innerHTML = getUser();