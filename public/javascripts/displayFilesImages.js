// function previewMultiple(event) {
//     var images = document.getElementById("image");
//     var number = images.files.length;
//     for (i = 0; i < number; i++) {
//         var urls = URL.createObjectURL(event.target.files[i]);
//         document.getElementById("formFile").innerHTML += '<img src="' + urls + '">';
//     }
// }

function previewMultiple(event) {
    const images = document.getElementById("image");
    const number = images.files.length;
    const formFileElement = document.getElementById("formFile");

    // Clear the existing content of formFileElement
    formFileElement.innerHTML = '';

    for (i = 0; i < number; i++) {
        const file = event.target.files[i];
        const urls = URL.createObjectURL(file);

        // Create a new div to hold the image and file name
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('image-preview');
        imageDiv.innerHTML = `
            <img src="${urls}">
            <p>${file.name.substring(0, 3)}(...)${file.name.substring(file.name.length - 4, file.name.length)}</p>
        `;

        formFileElement.appendChild(imageDiv);
    }
}
