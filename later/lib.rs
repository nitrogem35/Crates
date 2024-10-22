use futures_util::{SinkExt, StreamExt};
use tokio::{
    net::TcpStream,
};
use url::Url;
use tokio_tungstenite::{
    connect_async, tungstenite::{ 
        handshake::client::generate_key, 
        http::Request, 
        Message
    }, 
    MaybeTlsStream, 
    WebSocketStream
};
use napi::{
    bindgen_prelude::*,
    Env
};
use napi_derive::napi;


#[tokio::main]
#[napi]
async fn init(url: String, callback: Function, env: Env) {
    let socket_steam = build_socket(&url).await;
    let (mut write, mut read) = StreamExt::split(socket_steam);

    //setup our communication to Node

    while let Some(message) = read.next().await {
        let message = message.expect("Failed to read message");
        println!("Received msg: {}", message);
        
        let unwrapped = message.to_text().unwrap();
        //handle the message
        if unwrapped == "." {
            //just reply if it's a ping and continue listening
            let ping = Message::Text(".".into());
            write.send(ping).await.expect("Failed to send ping");
        } else {
            //call the callback here with the received message text
            
        }
    }

    
    println!("WebSocket closed.");
}

//Helper function that simply builds our websocket and returns it
async fn build_socket(url: &str) -> WebSocketStream<MaybeTlsStream<TcpStream>> {
    let url = Url::parse(url).unwrap();
    let parts: Vec<&str> = url.host_str().unwrap().split('.').collect();
    let domain = format!("{}.{}", parts[parts.len() - 2], parts[parts.len() - 1]);

    let req = Request::builder()
        .method("GET")
        .uri(url.as_str())
        .header("Host", url.host_str().unwrap())
        .header("Upgrade", "websocket")
        .header("Connection", "upgrade")
        .header("Sec-Websocket-Key", generate_key())
        .header("Sec-Websocket-Version", "13")
        .header("Origin", "https://".to_owned() + &domain)
        .header("User-Agent", "Mozilla/5.0 (Windows; Windows NT 10.0; Win64; x64; en-US) AppleWebKit/601.39 (KHTML, like Gecko) Chrome/54.0.1332.116 Safari/603.6 Edge/17.72605")
        .body(())
        .unwrap();

    println!("Connecting to: {}", url);
    let (ws_stream, _) = connect_async(req).await.expect("Failed to connect");
    println!("Connected to WebSocket");
    
    ws_stream
}