document.getElementById("image").addEventListener("change", previewMultiple);

function previewMultiple(event) {
    const images = event.target.files;
    const formFileElement = document.getElementById("formFile");

    // Clear the existing content of formFileElement
    formFileElement.innerHTML = '';

    for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const urls = URL.createObjectURL(file);

        // Create a new div to hold the image and file name
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('image-preview');
        imageDiv.innerHTML = `
    <img src="${urls}">
        <p>${file.name.substring(0, 3)}(...)${file.name.substring(file.name.length - 4, file.name.length)}</p>`;

        formFileElement.appendChild(imageDiv);
    }
}
