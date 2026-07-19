import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from '../../components/PaymentForm';
import { Button } from '../../components/ui/Button';
import { portalApi } from '../../api/portal';
import { paymentsApi } from '../../api/payments';
import { messageErreur } from '../../api/http';
import type { Invoice } from '../../types/invoice';
import { ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export function PortalInvoicePayment() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // État du paiement : une fois l'intention créée, on connaît le clientSecret et
  // la clé publique nécessaires pour initialiser Stripe Elements.
  const [initializing, setInitializing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    portalApi
      .findMonInvoice(Number(invoiceId))
      .then((inv) => setInvoice(inv))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const startPayment = async () => {
    if (!invoice) return;
    setInitializing(true);
    try {
      const res = await paymentsApi.createIntent(invoice.id);
      setStripePromise(loadStripe(res.publishableKey));
      setClientSecret(res.clientSecret);
      // L'id de la PaymentIntent est le préfixe du clientSecret ("pi_..._secret_...").
      setIntentId(res.clientSecret.slice(0, res.clientSecret.indexOf('_secret')));
    } catch (err) {
      toast.error(messageErreur(err));
    } finally {
      setInitializing(false);
    }
  };

  const handleSuccess = () => {
    setTimeout(() => navigate('/portail/factures'), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Button onClick={() => navigate('/portail/factures')} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux factures
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-900 font-semibold">Facture introuvable</p>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = invoice.statut === 'PAYE';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button onClick={() => navigate('/portail/factures')} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux factures
        </Button>

        {/* Détails de la facture */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold mb-1">{invoice.numero}</h1>
          <p className="text-gray-600 mb-6">Facture pour {invoice.clientNom}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Montant HT</p>
              <p className="text-xl font-semibold">{invoice.montantHT.toFixed(2)} €</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Montant TTC</p>
              <p className="text-2xl font-bold">{invoice.montantTTC.toFixed(2)} €</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Statut :</span>
            {isPaid ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ Payée
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                ⏳ En attente de paiement
              </span>
            )}
          </div>
        </div>

        {/* Déjà payée */}
        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Facture réglée</h2>
            <p className="text-green-800">Merci pour votre paiement.</p>
          </div>
        )}

        {/* Étape 1 : bouton pour démarrer le paiement */}
        {!isPaid && !clientSecret && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Régler cette facture</h2>
            <p className="text-gray-600 mb-6">
              Payez {invoice.montantTTC.toFixed(2)} € en ligne de façon sécurisée par carte.
            </p>
            <Button
              onClick={startPayment}
              disabled={initializing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {initializing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Initialisation…
                </>
              ) : (
                <>💳 Payer maintenant</>
              )}
            </Button>
          </div>
        )}

        {/* Étape 2 : formulaire Stripe Elements */}
        {!isPaid && clientSecret && stripePromise && intentId && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <PaymentForm
              intentId={intentId}
              montant={invoice.montantTTC}
              onSuccess={handleSuccess}
              onCancel={() => setClientSecret(null)}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
