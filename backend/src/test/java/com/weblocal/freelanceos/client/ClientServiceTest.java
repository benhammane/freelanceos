package com.weblocal.freelanceos.client;

import com.weblocal.freelanceos.auth.User;
import com.weblocal.freelanceos.auth.UserRepository;
import com.weblocal.freelanceos.client.dto.ClientAccessResponseDto;
import com.weblocal.freelanceos.common.ConflictException;
import com.weblocal.freelanceos.common.ResourceNotFoundException;
import com.weblocal.freelanceos.invoice.InvoiceRepository;
import com.weblocal.freelanceos.project.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock private ClientRepository clientRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private ClientService clientService;

    @BeforeEach
    void setUp() {
        clientService = new ClientService(
                clientRepository, projectRepository, invoiceRepository,
                userRepository, passwordEncoder, new ClientMapper()
        );
    }

    private Client unClient() {
        Client client = new Client();
        client.setId(1L);
        client.setNom("Acme Corp");
        client.setEmail("contact@acme.test");
        return client;
    }

    @Test
    void delete_refuseSiLeClientAEncoreDesProjets() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(unClient()));
        when(projectRepository.existsByClientId(1L)).thenReturn(true);

        assertThatThrownBy(() -> clientService.delete(1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("projet");

        verify(clientRepository, never()).delete(any());
    }

    @Test
    void delete_refuseSiLeClientAEncoreDesFactures() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(unClient()));
        when(projectRepository.existsByClientId(1L)).thenReturn(false);
        when(invoiceRepository.existsByClientId(1L)).thenReturn(true);

        assertThatThrownBy(() -> clientService.delete(1L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("devis/facture");

        verify(clientRepository, never()).delete(any());
    }

    @Test
    void delete_supprimeAussiLeCompteDaccesPortailSilExiste() {
        Client client = unClient();
        User acces = new User();
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(projectRepository.existsByClientId(1L)).thenReturn(false);
        when(invoiceRepository.existsByClientId(1L)).thenReturn(false);
        when(userRepository.findByClientId(1L)).thenReturn(Optional.of(acces));

        clientService.delete(1L);

        verify(userRepository).delete(acces);
        verify(clientRepository).delete(client);
    }

    @Test
    void genererAcces_hacheLeMotDePasseEtNeLeRenvoieQuUneFois() {
        Client client = unClient();
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(userRepository.findByClientId(1L)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hash-bcrypt");

        ClientAccessResponseDto acces = clientService.genererAcces(1L);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();

        assertThat(saved.getPassword()).isEqualTo("hash-bcrypt");
        assertThat(saved.getClient()).isEqualTo(client);
        assertThat(acces.email()).isEqualTo("contact@acme.test");
        assertThat(acces.motDePasseGenere()).hasSize(12);
        assertThat(acces.motDePasseGenere()).isNotEqualTo("hash-bcrypt");
    }

    @Test
    void findById_lanceResourceNotFoundExceptionSiInconnu() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
