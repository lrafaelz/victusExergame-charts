import { Link } from 'react-router-dom'

import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import logo from '../assets/images/VICTUS1b.png'; // Ajuste o caminho conforme necessário
import qrCode from '../assets/images/formQrCode.svg'; // Ajuste o caminho conforme necessário


export function NavbarVicuts() {
  return (
    <>
      <Navbar className='border-b-2'>
        <Container className='flex flex-row'>
          <Navbar.Brand>
            <Link className='p-3' to='/'>
            <img
              alt=""
              src={logo}
              width="300"
              height="300"
              className='align-top'
            />{' '}
            </Link>
          </Navbar.Brand>
          <div className='grow h-14'/>
          <Link className='p-3 flex flex-row items-center justify-center' to='https://forms.gle/Z3hnWQDT6F3o1Vi76' target='blank_' rel='noopener noreferrer'>
          <p className='text-center align-middle text-lg font-medium'>Avalie o Victus Charts:</p>
            <img
             src={qrCode}
              width="100"
              height="100"
              className='align-top'
             />
          </Link>
        </Container>
      </Navbar>
    </>
  );
}

