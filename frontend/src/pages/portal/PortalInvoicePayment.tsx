import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaymentForm } from '../../components/PaymentForm';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Invoice {
  id: number;
  numero: string;
  montantTotal: number;
  montantPaye: number;
  statut: string;
  client?: {
    email: string;
    nom: string;
  };
  user?: {
    email: string;
  };
}

export function PortalInvoicePayment() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [facture, setFacture] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [montantRestant, setMontantRestant] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Charger les détails de la facture
  useEffect(() => {
    const loadFacture = async () => {
      try {
        setLoading(true);
        // Pour le portal, on simule les données
        // En production, faire un appel API: GET /api/portail/invoices/{id}
        const mockFacture: Invoice = {
          id: parseInt(invoiceId || '0'),
          numero: `FAC-2026-${String(parseInt(invoiceId || '0')).padStart(4, '0')}`,
          montantTotal: 1500,
          montantPaye: 500,
          statut: 'SENT',
          client: {
            email: 'client@example.com',
            nom: 'Acme Corp'
          }
        };
        setFacture(mockFacture);
        setEmail(mockFacture.client?.email || '');
        setMontantRestant(mockFacture.montantTotal - mockFacture.montantPaye);
        setLoading(false);
      } catch (err) {
        toast.error('Erreur lors du chargement de la facture');
        console.error('Error loading invoice:', err);
        setLoading(false);
      }
    };

    if (invoiceId) {
      loadFacture();
    }
  }, [invoiceId]);

  const handlePaymentSuccess = () => {
    toast.success('Paiement réussi! Merci.');
    setTimeout(() => {
      navigate('/portail');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-600">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Button onClick={() => navigate('/portail')} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux factures
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-semibold">Facture non trouvée</p>
          </div>
        </div>
      </div>
    );
  }

  const isFullyPaid = montantRestant <= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <Button onClick={() => navigate('/portail')} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux factures
        </Button>

        {/* Facture Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{facture.numero}</h1>
          <p className="text-gray-600 mb-6">Facture pour {facture.client?.nom}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-2xl font-bold">{(facture.montantTotal / 100).toFixed(2)} €</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Montant payé</p>
              <p className="text-2xl font-bold text-green-600">{(facture.montantPaye / 100).toFixed(2)} €</p>
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700">Statut:</span>
            {isFullyPaid ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ Entièrement payée
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                ⏳ Paiement en attente
              </span>
            )}
          </div>

          {/* Montant restant */}
          {!isFullyPaid && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-6">
              <p className="text-sm text-blue-700 mb-2">Montant à payer:</p>
              <p className="text-3xl font-bold text-blue-900">
                {(montantRestant / 100).toFixed(2)} €
              </p>
            </div>
          )}
        </div>

        {/* Payment Form */}
        {!isFullyPaid && !showPaymentForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Prêt à payer?</h2>
            <p className="text-gray-600 mb-6">
              Cliquez sur le bouton ci-dessous pour procéder au paiement de votre facture.
            </p>
            <Button
              onClick={() => setShowPaymentForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              💳 Payer maintenant
            </Button>
          </div>
        )}

        {/* Payment Form Component */}
        {!isFullyPaid && showPaymentForm && (
          <div className="mb-6">
            <PaymentForm
              factureId={facture.id}
              montant={montantRestant}
              email={email}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        )}

        {/* Already Paid */}
        {isFullyPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Facture payée</h2>
            <p className="text-green-800 mb-6">
              Merci pour votre paiement! Votre facture est complètement réglée.
            </p>
            <Button onClick={() => navigate('/portail')} variant="outline">
              Voir mes factures
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
