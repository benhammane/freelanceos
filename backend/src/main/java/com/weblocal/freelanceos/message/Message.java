package com.weblocal.freelanceos.message;

import com.weblocal.freelanceos.auth.Role;
import com.weblocal.freelanceos.client.Client;
import com.weblocal.freelanceos.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Un message échangé entre le freelance (ADMIN) et un client, dans le fil de
 * discussion propre à ce client. La "conversation" n'est pas une entité à part :
 * c'est simplement l'ensemble des messages rattachés à un même Client.
 *
 * senderRole indique qui a écrit (ADMIN ou CLIENT) ; lu indique si le
 * destinataire (l'autre partie) a vu le message.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_messages_client", columnList = "client_id")
})
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role senderRole;

    @Column(nullable = false)
    private Long senderUserId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    /** true une fois que le destinataire (l'autre partie) a ouvert la conversation. */
    @Column(nullable = false)
    private boolean lu = false;
}
