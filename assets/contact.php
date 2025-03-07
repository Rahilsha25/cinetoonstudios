<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $phone = $_POST["phone"];
    $message = $_POST["message"];

    // Your email address (where the form data will be sent)
    $to = "cinetoonstudios@gmail.com"; // Change this to your email
    $subject = "Inquiry From $name";
    
    $body = "Name: $name\n";
    $body .= "Email: $email\n";
    $body .= "Phone: $phone\n";
    $body .= "Message: $message\n";

    $headers = "From: $email" . "\r\n" . 
               "Reply-To: $email" . "\r\n" .
               "Content-Type: text/plain; charset=UTF-8";

    if (mail($to, $subject, $body, $headers)) {
        echo "success";
    } else {
        echo "error";
    }
}
?>
