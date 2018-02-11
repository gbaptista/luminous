> *Se você encontrar informações faltando ou erros em alguma das traduções, nos ajude abrindo um [pull request](https://github.com/gbaptista/luminous/pulls) com as modificações necessárias nos textos para que todos tenham acesso aos guias em seu idioma.*

# Guias
> [voltar ao índice](../)

## O que é detectado?
> [en-US](../../../en-US/guides/how-it-works/what-is_detected.md) | [es](../../../es/guides/how-it-works/what-is_detected.md) | pt-BR

| WebAPI         | method              | intercepted?       | reported?          | can be bocked?     |
| -------------- | ------------------- | ------------------ | ------------------ | ------------------ |
| EventTarget    | removeEventListener | :white_check_mark: | :x:                | :x:                |
| EventTarget    | addEventListener    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Window         | setTimeout          | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Window         | setInterval         | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| WebSocket      | send                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Geolocation    | getCurrentPosition  | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Geolocation    | watchPosition       | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| XMLHttpRequest | open                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| XMLHttpRequest | send                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Fetch API      | fetch               | :white_check_mark: | :white_check_mark: | :white_check_mark: |
