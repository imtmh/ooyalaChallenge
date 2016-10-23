
function makeAPICall(assetId, name) {
    console.log("test");
    var api_key, secret, url, body;
    api_key = 'VsOGkyOqIcMcPLI9ebckMAUtem-4.U6hPS';
    secret = '4RMGiqDWtXFuz5DuOVIXfGb7dq6K68yP6inDsglU';
    url = 'https://api.ooyala.com/v2/assets/' + assetId;
    body = '{"name":"' +name+ '"}';
    return $.ajax({
        url: "https://api.ooyala.com/docs/api_scratchpad/request",
        type: "POST",
        dataType: "json",
        data: {
            url: url,
            method: "PATCH",
            body: body,
            api_key: api_key,
            secret: secret,
            account_type: 'user'
        },
        success: function(response) {
            alert(response);
        }
    });
}
function temppp(){
    console.log("testttt");
}