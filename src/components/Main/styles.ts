import styled from 'styled-components'

export const Container = styled.div`
  height: 100vh;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  button {
    margin-top: 24px;
  }

  a {
    img {
      height: 12px;
      padding-left: 4px;
    }
  }

  h6 {
    width: 300px;
    text-align: right;
    font-size: 16px;
    margin-top: 5px;
  }
`

export const Image = styled.img`
  width: 300px;
`

export const Text = styled.p`
  margin-top: 24px;
  font-size: 18px;
`
