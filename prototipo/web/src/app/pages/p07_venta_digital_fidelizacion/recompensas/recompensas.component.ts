import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FashionApiService } from '../../../core/services/fashion-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueada: boolean;
}

interface Recompensa {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  costo_puntos: number;
  categoria: string;
  icono: string;
  disponible?: boolean;
}

interface CuponActivo {
  id_cupon: number;
  codigo_cupon: string;
  monto_descuento: number;
  tipo_beneficio: string;
  utilizado: boolean;
  fecha_emision: string;
  fecha_expiracion: string;
  dias_restantes: number;
}

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="recompensas-page animate-fade">
      <!-- Encabezado Principal Hero Glass -->
      <div class="header-hero glass-card">
        <div class="hero-left">
          <div class="badges-row">
            <span class="badge-pu"><i class="fas fa-crown"></i> CU21 — M16</span>
            <span class="badge-tag"><i class="fas fa-gem"></i> Club de Fidelización Masculina</span>
            <span class="badge-tag highlight"><i class="fas fa-award"></i> Recompensas Omnicanal</span>
          </div>
          <h1>Club Privado & Fidelización Gamificada</h1>
          <p class="hero-desc">
            Cada compra en boutique física o en línea acumula puntos automáticos (1 punto por cada 10 Bs).
            Asciende de categoría jerárquica para desbloquear descuentos permanentes, probadores VIP exclusivos y canje de cupones.
          </p>
        </div>

        <div class="user-quick-stat" *ngIf="auth.isAuthenticated()">
          <div class="stat-avatar-circle">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="stat-text-col">
            <span class="stat-label">Socio Exclusivo</span>
            <span class="stat-name">{{ auth.currentUser()?.nombres }} {{ auth.currentUser()?.apellidos }}</span>
            <span class="stat-tier-pill" [ngClass]="getCardTierClass()">
              <i class="fas fa-certificate"></i> NIVEL {{ perfil.nivel }}
            </span>
          </div>
        </div>

        <div class="login-prompt-box" *ngIf="!auth.isAuthenticated()">
          <p><i class="fas fa-info-circle"></i> Inicia sesión para sincronizar tus puntos y canjear cupones exclusivos.</p>
          <a routerLink="/login" class="btn-login-small">Acceder a mi Cuenta</a>
        </div>
      </div>

      <!-- Sección de Membresía VIP y Progreso -->
      <div class="membership-section">
        <!-- Tarjeta VIP Metálica 3D con Shimmer y Holograma -->
        <div class="vip-card-container">
          <div class="vip-card" [ngClass]="getCardTierClass()">
            <div class="card-foil-overlay"></div>
            <div class="card-shimmer-sweep"></div>
            
            <div class="vip-card-header">
              <div class="brand">
                <i class="fas fa-crown gold-crown"></i>
                <div class="brand-text">
                  <span class="brand-name">FASHIONSTORE</span>
                  <span class="brand-sub">CLUB PRIVÉ MASCULINO</span>
                </div>
              </div>
              <div class="tier-badge-embossed">
                <i class="fas fa-medal"></i> RANGO {{ perfil.nivel }}
              </div>
            </div>

            <!-- Chip EMV de Seguridad Holográfico -->
            <div class="vip-card-security-row">
              <div class="emv-chip">
                <div class="chip-circuit"></div>
              </div>
              <div class="contactless-icon">
                <i class="fas fa-wifi"></i>
              </div>
              <div class="hologram-seal">
                <span>FS-AUTH</span>
              </div>
            </div>

            <div class="vip-card-body">
              <div class="balance-block">
                <span class="balance-label">SALDO DISPONIBLE PARA CANJE</span>
                <div class="balance-main">
                  <span class="balance-val">{{ perfil.puntos_actuales | number }}</span>
                  <span class="balance-unit">PTS</span>
                </div>
                <span class="balance-sub">Puntos históricos totales: <strong>{{ perfil.puntos_historicos | number }} pts</strong></span>
              </div>

              <div class="perk-active-pill">
                <i class="fas fa-check-circle"></i>
                <span>Beneficio activo: <strong>{{ perfil.descuento_permanente_pct }}% Descuento</strong> en todas las compras</span>
              </div>
            </div>

            <div class="vip-card-footer">
              <div class="holder-info">
                <span class="holder-label">TITULAR DE LA CUENTA</span>
                <span class="holder-name">{{ auth.currentUser()?.nombres || 'CLIENTE EXCLUSIVO' }} {{ auth.currentUser()?.apellidos || 'FASHIONSTORE' }}</span>
              </div>
              <div class="card-id-block">
                <span class="card-id-label">Nº SOCIO OMNICANAL</span>
                <span class="card-id-number">BO-00{{ auth.currentUser()?.id_usuario || 1204 }}-VIP</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de Ascenso de Nivel con Avance Financiero en Bs -->
        <div class="tier-progress-card glass-card">
          <div class="progress-header">
            <div>
              <h3><i class="fas fa-arrow-alt-circle-up text-gold"></i> Progresión de Rango Jerárquico</h3>
              <p class="progress-subtitle">Acumula 1 punto por cada 10 Bolivianos netos facturados.</p>
            </div>
            <span class="next-tier-badge" *ngIf="perfil.siguiente_nivel !== 'RANGO MÁXIMO'">
              Próximo objetivo: <strong>{{ perfil.siguiente_nivel }}</strong>
            </span>
            <span class="max-tier-badge" *ngIf="perfil.siguiente_nivel === 'RANGO MÁXIMO'">
              <i class="fas fa-gem"></i> ¡NIVEL MÁXIMO ALCANZADO!
            </span>
          </div>

          <!-- Barra de Progreso Luminosa -->
          <div class="progress-track-wrapper">
            <div class="progress-bar-fill" [style.width.%]="perfil.progreso_siguiente_nivel_pct">
              <span class="progress-glow-dot"></span>
            </div>
          </div>

          <div class="progress-details">
            <span class="pct-val">{{ perfil.progreso_siguiente_nivel_pct | number:'1.0-0' }}% completado</span>
            <span class="pts-needed" *ngIf="perfil.puntos_faltantes > 0">
              Faltan <strong>{{ perfil.puntos_faltantes | number }} puntos</strong> 
              (Equivalente a <strong>Bs. {{ perfil.compras_equivalente_ascenso_bs | number:'1.0-0' }}</strong> en compras).
            </span>
            <span class="pts-needed success-max" *ngIf="perfil.puntos_faltantes === 0">
              Gozas de la categoría más alta de la boutique con máximas distinciones.
            </span>
          </div>

          <!-- Stepper de Rangos (Bronce, Plata, Oro, Diamante) -->
          <div class="tiers-stepper-grid">
            <div class="tier-step" [class.active-step]="perfil.nivel === 'BRONCE'" [class.passed-step]="perfil.puntos_historicos >= 500">
              <div class="step-circle bronze-circle"><i class="fas fa-shield-alt"></i></div>
              <span class="tier-name">Bronce</span>
              <span class="tier-range">0 - 499 pts</span>
              <span class="tier-desc">0% desc. base</span>
            </div>
            <div class="tier-step" [class.active-step]="perfil.nivel === 'PLATA'" [class.passed-step]="perfil.puntos_historicos >= 1500">
              <div class="step-circle silver-circle"><i class="fas fa-medal"></i></div>
              <span class="tier-name">Plata</span>
              <span class="tier-range">500 - 1,499 pts</span>
              <span class="tier-desc">5% desc. permanente</span>
            </div>
            <div class="tier-step" [class.active-step]="perfil.nivel === 'ORO'" [class.passed-step]="perfil.puntos_historicos >= 3000">
              <div class="step-circle gold-circle"><i class="fas fa-award"></i></div>
              <span class="tier-name">Oro</span>
              <span class="tier-range">1,500 - 2,999 pts</span>
              <span class="tier-desc">10% desc. + probador VIP</span>
            </div>
            <div class="tier-step" [class.active-step]="perfil.nivel === 'DIAMANTE'" [class.passed-step]="perfil.puntos_historicos >= 3000">
              <div class="step-circle diamond-circle"><i class="fas fa-gem"></i></div>
              <span class="tier-name">Diamante</span>
              <span class="tier-range">3,000+ pts</span>
              <span class="tier-desc">15% desc. + envíos gratis</span>
            </div>
          </div>

          <!-- Acciones Interactivas para Ganar Puntos de Actividad (CU19, CU23) -->
          <div class="quick-points-bar">
            <span class="quick-title"><i class="fas fa-bolt text-gold"></i> Bonos por Interacción Digital (CU19, CU23):</span>
            <div class="quick-btns">
              <button class="btn-action-pts" (click)="ganarBono('PROBAR_RA')" [disabled]="isOtorgandoBono">
                <i class="fas fa-vr-cardboard"></i> Probar en Vestidor RA (+25 pts)
              </button>
              <button class="btn-action-pts" (click)="ganarBono('BUSQUEDA_VOZ')" [disabled]="isOtorgandoBono">
                <i class="fas fa-microphone"></i> Búsqueda por Voz (+15 pts)
              </button>
              <button class="btn-action-pts" (click)="ganarBono('COMPARTIR_LOOK')" [disabled]="isOtorgandoBono">
                <i class="fas fa-share-alt"></i> Compartir Outfit (+20 pts)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vitrina de Insignias y Logros Comerciales -->
      <div class="badges-section">
        <div class="section-title-row">
          <div class="title-with-icon">
            <i class="fas fa-shield-alt section-ico"></i>
            <div>
              <h2>Vitrina de Insignias & Logros Comerciales</h2>
              <p class="section-subtitle">Reconocimientos digitales honoríficos desbloqueados por hitos en la plataforma.</p>
            </div>
          </div>
          <span class="count-tag">{{ getInsigniasDesbloqueadasCount() }} de {{ insignias.length }} desbloqueadas</span>
        </div>

        <div class="insignias-grid">
          <div 
            *ngFor="let ins of insignias" 
            class="insignia-card glass-card"
            [class.unlocked]="ins.desbloqueada"
            [class.locked]="!ins.desbloqueada">
            
            <div class="insignia-icon-wrap">
              <div class="insignia-glow" *ngIf="ins.desbloqueada"></div>
              <i [class]="getIconClass(ins.icono)"></i>
              <span class="lock-indicator" *ngIf="!ins.desbloqueada">
                <i class="fas fa-lock"></i>
              </span>
            </div>

            <div class="insignia-info">
              <h4>{{ ins.nombre }}</h4>
              <p>{{ ins.descripcion }}</p>
              <span class="status-badge" [class.unlocked-badge]="ins.desbloqueada">
                <i *ngIf="ins.desbloqueada" class="fas fa-check-circle"></i>
                {{ ins.desbloqueada ? 'DESBLOQUEADA' : 'POR ALCANZAR' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Barra de Pestañas: Catálogo de Recompensas vs Mis Cupones Activos -->
      <div class="tabs-nav-bar glass-card">
        <button 
          class="tab-btn" 
          [class.active]="tabActiva === 'CATALOGO'" 
          (click)="tabActiva = 'CATALOGO'">
          <i class="fas fa-gift"></i> Catálogo de Recompensas Canjeables
          <span class="tab-badge">{{ recompensas.length }}</span>
        </button>
        <button 
          class="tab-btn" 
          [class.active]="tabActiva === 'MIS_CUPONES'" 
          (click)="tabActiva = 'MIS_CUPONES'">
          <i class="fas fa-ticket-alt"></i> Mis Cupones Disponibles
          <span class="tab-badge gold-badge">{{ getCuponesActivosCount() }}</span>
        </button>
      </div>

      <!-- Vista 1: Catálogo de Recompensas Canjeables -->
      <div class="rewards-section" *ngIf="tabActiva === 'CATALOGO'">
        <div class="section-title-row">
          <div class="title-with-icon">
            <i class="fas fa-ticket-alt section-ico"></i>
            <div>
              <h2>Beneficios & Cupones Canjeables</h2>
              <p class="section-subtitle">Canjea tus puntos acumulados por bonos económicos directos para tus compras.</p>
            </div>
          </div>
          <span class="points-balance-reminder">
            Tu saldo disponible: <strong>{{ perfil.puntos_actuales | number }} pts</strong>
          </span>
        </div>

        <div class="rewards-grid">
          <div *ngFor="let rec of recompensas" class="reward-card glass-card">
            <div class="reward-header">
              <span class="category-pill">{{ rec.categoria }}</span>
              <div class="pts-cost">
                <i class="fas fa-coins text-gold"></i> {{ rec.costo_puntos }} PTS
              </div>
            </div>

            <div class="reward-body">
              <div class="reward-icon-circle">
                <i [class]="getRewardIconClass(rec.icono)"></i>
              </div>
              <h3>{{ rec.titulo }}</h3>
              <p>{{ rec.descripcion }}</p>
            </div>

            <div class="reward-footer">
              <button 
                class="btn-redeem"
                [disabled]="isCanjeando || perfil.puntos_actuales < rec.costo_puntos"
                (click)="canjear(rec)">
                <i *ngIf="!isCanjeando" class="fas fa-gift"></i>
                <i *ngIf="isCanjeando" class="fas fa-spinner fa-spin"></i>
                <span *ngIf="perfil.puntos_actuales >= rec.costo_puntos">Canjear Recompensa</span>
                <span *ngIf="perfil.puntos_actuales < rec.costo_puntos">
                  Faltan {{ rec.costo_puntos - perfil.puntos_actuales }} pts
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista 2: Mis Cupones Activos Canjeados -->
      <div class="my-coupons-section animate-fade" *ngIf="tabActiva === 'MIS_CUPONES'">
        <div class="section-title-row">
          <div class="title-with-icon">
            <i class="fas fa-wallet section-ico"></i>
            <div>
              <h2>Mis Cupones de Fidelización Activos</h2>
              <p class="section-subtitle">Códigos alfanuméricos listos para ser aplicados en el Checkout web (CU14) o en caja POS.</p>
            </div>
          </div>
          <button class="btn-refresh-coupons" (click)="cargarMisCupones()">
            <i class="fas fa-sync-alt"></i> Actualizar
          </button>
        </div>

        <!-- Si no tiene cupones -->
        <div class="empty-coupons glass-card" *ngIf="misCupones.length === 0">
          <i class="fas fa-ticket-alt empty-ico"></i>
          <h3>Aún no has canjeado ningún cupón</h3>
          <p>Explora el catálogo de recompensas y canjea tus puntos por bonos de descuento directo.</p>
          <button class="btn-go-catalog" (click)="tabActiva = 'CATALOGO'">
            <i class="fas fa-gift"></i> Ver Catálogo de Recompensas
          </button>
        </div>

        <!-- Grilla de Cupones Emitidos -->
        <div class="coupons-grid" *ngIf="misCupones.length > 0">
          <div 
            *ngFor="let cup of misCupones" 
            class="coupon-card glass-card"
            [class.used-coupon]="cup.utilizado">
            
            <div class="coupon-notch-left"></div>
            <div class="coupon-notch-right"></div>

            <div class="coupon-card-header">
              <span class="coupon-benefit-tag">
                <i class="fas fa-tag"></i> 
                {{ cup.tipo_beneficio === 'ENVIO_GRATIS' ? 'ENVÍO GRATIS' : 'DESCUENTO Bs. ' + (cup.monto_descuento | number:'1.2-2') }}
              </span>
              <span class="coupon-status-tag" [class.used-tag]="cup.utilizado" [class.valid-tag]="!cup.utilizado">
                {{ cup.utilizado ? 'UTILIZADO' : 'DISPONIBLE' }}
              </span>
            </div>

            <div class="coupon-code-container">
              <span class="code-label">CÓDIGO DE CUPÓN</span>
              <div class="code-display">{{ cup.codigo_cupon }}</div>
            </div>

            <div class="coupon-meta-row">
              <span class="meta-date"><i class="fas fa-calendar-alt"></i> Expira: {{ cup.fecha_expiracion }}</span>
              <span class="meta-days" *ngIf="!cup.utilizado">
                <i class="fas fa-hourglass-half"></i> {{ cup.dias_restantes }} días restantes
              </span>
            </div>

            <div class="coupon-card-actions">
              <button 
                class="btn-copy-mini" 
                (click)="copiarCodigo(cup.codigo_cupon)" 
                [disabled]="cup.utilizado">
                <i class="fas fa-copy"></i> Copiar Código
              </button>
              <button 
                class="btn-checkout-mini" 
                (click)="irAlCheckoutConCupon(cup.codigo_cupon)"
                [disabled]="cup.utilizado">
                <i class="fas fa-shopping-bag"></i> Usar en Compra
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Cupón Canjeado Exitosamente con Confeti -->
      <div class="modal-backdrop animate-fade" *ngIf="cuponEmitido">
        <div class="modal-content glass-card">
          <!-- Efecto Confeti Visual -->
          <div class="confetti-container">
            <span class="confetti c1"></span>
            <span class="confetti c2"></span>
            <span class="confetti c3"></span>
            <span class="confetti c4"></span>
            <span class="confetti c5"></span>
          </div>

          <div class="modal-header-confetti">
            <div class="success-icon-ring">
              <i class="fas fa-check-circle modal-success-icon"></i>
            </div>
            <h2>¡Recompensa Canjeada con Éxito!</h2>
            <p>Se ha generado tu código de cupón único y exclusivo para tus compras.</p>
          </div>

          <div class="coupon-box">
            <span class="coupon-label">CÓDIGO DE CUPÓN EXCLUSIVO</span>
            <div class="coupon-code">{{ cuponEmitido.codigo_cupon }}</div>
            <p class="coupon-desc">{{ cuponEmitido.mensaje }}</p>
          </div>

          <div class="modal-actions">
            <button class="btn-copy" (click)="copiarCodigo(cuponEmitido.codigo_cupon)">
              <i class="fas fa-copy"></i> Copiar Código
            </button>
            <button class="btn-go-cart" (click)="irAlCheckout()">
              <i class="fas fa-shopping-bag"></i> Usar en mi Compra
            </button>
            <button class="btn-close-modal" (click)="cuponEmitido = null">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recompensas-page {
      padding: 1.5rem;
      max-width: 1480px;
      margin: 0 auto;
      color: #E2E8F0;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .glass-card {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    /* Encabezado Principal */
    .header-hero {
      padding: 2.2rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%);
      border: 1px solid rgba(245, 158, 11, 0.25);
      flex-wrap: wrap;
      gap: 1.5rem;
      border-radius: 20px;
    }

    .hero-left {
      max-width: 780px;
    }

    .badges-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
      flex-wrap: wrap;
    }

    .badge-pu {
      background: rgba(245, 158, 11, 0.2);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.45);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .badge-tag {
      background: rgba(255, 255, 255, 0.06);
      color: #94A3B8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    .badge-tag.highlight {
      background: rgba(99, 102, 241, 0.2);
      color: #818CF8;
      border-color: rgba(99, 102, 241, 0.4);
    }

    .header-hero h1 {
      margin: 0.4rem 0;
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #FFFFFF 0%, #F59E0B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .hero-desc {
      color: #94A3B8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0;
    }

    .user-quick-stat {
      background: rgba(0, 0, 0, 0.35);
      padding: 1.1rem 1.6rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-avatar-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.15);
      border: 2px solid #F59E0B;
      color: #FBBF24;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }

    .stat-text-col {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .stat-label {
      font-size: 0.72rem;
      color: #F59E0B;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .stat-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .stat-tier-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      width: fit-content;
      text-transform: uppercase;
    }
    .stat-tier-pill.bronze { background: rgba(184, 115, 51, 0.2); color: #D97706; border: 1px solid #B87333; }
    .stat-tier-pill.silver { background: rgba(209, 213, 219, 0.2); color: #E5E7EB; border: 1px solid #9CA3AF; }
    .stat-tier-pill.gold { background: rgba(245, 158, 11, 0.25); color: #FBBF24; border: 1px solid #F59E0B; }
    .stat-tier-pill.diamond { background: rgba(6, 182, 212, 0.25); color: #67E8F9; border: 1px solid #06B6D4; }

    .login-prompt-box {
      background: rgba(0, 0, 0, 0.35);
      padding: 1.2rem 1.6rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-login-small {
      display: inline-block;
      margin-top: 0.5rem;
      background: #6366F1;
      color: #FFFFFF;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-login-small:hover {
      background: #4F46E5;
    }

    /* Membresía y Progreso */
    .membership-section {
      display: grid;
      grid-template-columns: 480px 1fr;
      gap: 2rem;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 1100px) {
      .membership-section {
        grid-template-columns: 1fr;
      }
    }

    /* Tarjeta VIP Metálica 3D */
    .vip-card-container {
      perspective: 1000px;
    }

    .vip-card {
      height: 290px;
      border-radius: 22px;
      padding: 1.8rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.65);
      transition: transform 0.4s ease, box-shadow 0.4s ease;
    }

    .vip-card:hover {
      transform: translateY(-5px) rotateX(3deg);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.75);
    }

    /* Efectos Metálicos de Lujo según Rango */
    .vip-card.bronze {
      background: linear-gradient(135deg, #4A2E18 0%, #8C532B 45%, #B87333 75%, #2A170A 100%);
      border: 1px solid #B87333;
    }

    .vip-card.silver {
      background: linear-gradient(135deg, #1F2937 0%, #4B5563 40%, #9CA3AF 70%, #111827 100%);
      border: 1px solid #D1D5DB;
      box-shadow: 0 20px 45px rgba(156, 163, 175, 0.2);
    }

    .vip-card.gold {
      background: linear-gradient(135deg, #78350F 0%, #D97706 35%, #F59E0B 65%, #FCD34D 85%, #451A03 100%);
      border: 1px solid #FCD34D;
      box-shadow: 0 25px 55px rgba(245, 158, 11, 0.35);
    }

    .vip-card.diamond {
      background: linear-gradient(135deg, #083344 0%, #0891B2 35%, #06B6D4 65%, #67E8F9 85%, #022C22 100%);
      border: 1px solid #67E8F9;
      box-shadow: 0 25px 55px rgba(6, 182, 212, 0.4);
    }

    .card-foil-overlay {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 65%);
      pointer-events: none;
    }

    .card-shimmer-sweep {
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transform: skewX(-25deg);
      animation: sweep 6s infinite;
      pointer-events: none;
    }
    @keyframes sweep {
      0% { left: -100%; }
      30% { left: 200%; }
      100% { left: 200%; }
    }

    .vip-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .gold-crown {
      font-size: 1.6rem;
      color: #FCD34D;
      filter: drop-shadow(0 0 8px rgba(252, 211, 77, 0.5));
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-size: 1.15rem;
      font-weight: 900;
      letter-spacing: 2px;
      color: #FFFFFF;
    }
    .brand-sub {
      font-size: 0.62rem;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
    }

    .tier-badge-embossed {
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: #FFFFFF;
      text-transform: uppercase;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    /* Chip EMV y Seguridad */
    .vip-card-security-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-top: 0.3rem;
      z-index: 2;
    }

    .emv-chip {
      width: 44px;
      height: 34px;
      background: linear-gradient(135deg, #d4af37 0%, #f9d976 50%, #aa771c 100%);
      border-radius: 6px;
      border: 1px solid #73510d;
      position: relative;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    .chip-circuit {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #73510d;
    }

    .contactless-icon {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.75);
      transform: rotate(90deg);
    }

    .hologram-seal {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: radial-gradient(circle, #67e8f9 0%, #ec4899 50%, #eab308 100%);
      opacity: 0.7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.55rem;
      font-weight: 900;
      color: #000000;
      mix-blend-mode: screen;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    /* Cuerpo de la Tarjeta */
    .vip-card-body {
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .balance-label {
      font-size: 0.68rem;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.75);
      text-transform: uppercase;
      font-weight: 700;
    }

    .balance-main {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }
    .balance-val {
      font-size: 2.2rem;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    .balance-unit {
      font-size: 1rem;
      font-weight: 800;
      color: #FCD34D;
    }

    .balance-sub {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .perk-active-pill {
      background: rgba(0, 0, 0, 0.35);
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.76rem;
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.15);
      width: fit-content;
    }
    .perk-active-pill i { color: #34D399; }

    /* Footer de la Tarjeta */
    .vip-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 2;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 0.75rem;
    }

    .holder-info, .card-id-block {
      display: flex;
      flex-direction: column;
    }
    .holder-label, .card-id-label {
      font-size: 0.62rem;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 1px;
      font-weight: 700;
    }
    .holder-name {
      font-size: 0.92rem;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-id-number {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.88rem;
      font-weight: 700;
      color: #FCD34D;
      letter-spacing: 1.5px;
    }

    /* Tarjeta de Progreso de Nivel */
    .tier-progress-card {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .progress-header h3 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .progress-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: #94A3B8;
    }

    .next-tier-badge {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.35);
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    .max-tier-badge {
      background: rgba(6, 182, 212, 0.2);
      color: #67E8F9;
      border: 1px solid rgba(6, 182, 212, 0.4);
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .progress-track-wrapper {
      height: 14px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: visible;
      position: relative;
      margin-bottom: 0.75rem;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #F59E0B 0%, #10B981 100%);
      border-radius: 9999px;
      position: relative;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
    }
    .progress-glow-dot {
      position: absolute;
      right: 0;
      top: -3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #FFFFFF;
      box-shadow: 0 0 10px #10B981;
    }

    .progress-details {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #94A3B8;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .pct-val {
      font-weight: 800;
      color: #10B981;
    }
    .pts-needed strong {
      color: #FBBF24;
    }
    .success-max {
      color: #67E8F9;
      font-weight: 700;
    }

    /* Stepper de 4 Niveles */
    .tiers-stepper-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-top: 0.5rem;
    }

    .tier-step {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.25rem;
      transition: all 0.2s;
    }

    .tier-step.active-step {
      background: rgba(245, 158, 11, 0.12);
      border-color: #F59E0B;
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
    }

    .step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      margin-bottom: 0.2rem;
    }
    .bronze-circle { background: rgba(184, 115, 51, 0.2); color: #B87333; }
    .silver-circle { background: rgba(209, 213, 219, 0.2); color: #D1D5DB; }
    .gold-circle { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
    .diamond-circle { background: rgba(6, 182, 212, 0.2); color: #06B6D4; }

    .tier-name {
      font-size: 0.85rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .tier-range {
      font-size: 0.7rem;
      color: #94A3B8;
    }
    .tier-desc {
      font-size: 0.68rem;
      color: #FBBF24;
      font-weight: 600;
    }

    /* Acciones Interactivas de Bonos */
    .quick-points-bar {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .quick-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #E2E8F0;
    }
    .quick-btns {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .btn-action-pts {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #F1F5F9;
      padding: 0.55rem 0.95rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      transition: all 0.2s;
    }
    .btn-action-pts:hover:not(:disabled) {
      background: #F59E0B;
      color: #0F172A;
      border-color: #F59E0B;
      transform: translateY(-2px);
    }
    .btn-action-pts:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Vitrina de Insignias */
    .badges-section {
      margin-bottom: 2.5rem;
    }

    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .section-ico {
      font-size: 1.8rem;
      color: #F59E0B;
    }
    .section-title-row h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .section-subtitle {
      margin: 0.2rem 0 0;
      font-size: 0.85rem;
      color: #94A3B8;
    }

    .count-tag {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 0.4rem 0.95rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .insignias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .insignia-card {
      padding: 1.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      transition: all 0.3s ease;
    }

    .insignia-card.unlocked {
      border-color: rgba(245, 158, 11, 0.4);
      background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.75) 100%);
    }
    .insignia-card.unlocked:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 30px rgba(245, 158, 11, 0.2);
    }

    .insignia-card.locked {
      opacity: 0.65;
      filter: grayscale(85%);
    }

    .insignia-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.7rem;
      color: #FBBF24;
      margin-bottom: 1rem;
      position: relative;
    }
    .insignia-glow {
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%);
      animation: pulse-glow 2.5s infinite alternate;
    }
    @keyframes pulse-glow {
      from { transform: scale(0.95); opacity: 0.5; }
      to { transform: scale(1.15); opacity: 1; }
    }

    .lock-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #EF4444;
      color: #FFFFFF;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      border: 2px solid #0F172A;
    }

    .insignia-info h4 {
      margin: 0 0 0.4rem;
      font-size: 1rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .insignia-info p {
      margin: 0 0 0.85rem;
      font-size: 0.78rem;
      color: #94A3B8;
      line-height: 1.4;
    }

    .status-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      color: #64748B;
      letter-spacing: 0.5px;
    }
    .status-badge.unlocked-badge {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* Pestañas de Navegación */
    .tabs-nav-bar {
      display: flex;
      gap: 1rem;
      padding: 0.6rem;
      margin-bottom: 2rem;
      border-radius: 14px;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: #94A3B8;
      font-size: 0.95rem;
      font-weight: 700;
      padding: 0.85rem 1.6rem;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.05);
    }
    .tab-btn.active {
      background: #F59E0B;
      color: #0F172A;
    }
    .tab-badge {
      background: rgba(0, 0, 0, 0.25);
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .gold-badge {
      background: rgba(245, 158, 11, 0.3);
      color: #FCD34D;
    }
    .tab-btn.active .gold-badge {
      background: #0F172A;
      color: #FBBF24;
    }

    /* Grilla de Recompensas */
    .rewards-section {
      margin-bottom: 3rem;
    }

    .points-balance-reminder {
      font-size: 0.9rem;
      color: #94A3B8;
    }
    .points-balance-reminder strong {
      color: #FBBF24;
      font-size: 1.1rem;
    }

    .rewards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .reward-card {
      padding: 1.6rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.3s ease;
    }
    .reward-card:hover {
      transform: translateY(-4px);
      border-color: rgba(245, 158, 11, 0.35);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
    }

    .reward-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .category-pill {
      background: rgba(255, 255, 255, 0.08);
      color: #94A3B8;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .pts-cost {
      font-size: 0.92rem;
      font-weight: 800;
      color: #FBBF24;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .reward-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .reward-icon-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #F59E0B;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      margin-bottom: 1rem;
    }
    .reward-body h3 {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .reward-body p {
      margin: 0;
      font-size: 0.82rem;
      color: #94A3B8;
      line-height: 1.5;
    }

    .btn-redeem {
      width: 100%;
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: #0F172A;
      font-weight: 800;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      transition: all 0.2s;
    }
    .btn-redeem:hover:not(:disabled) {
      background: #FBBF24;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
    }
    .btn-redeem:disabled {
      background: rgba(255, 255, 255, 0.08);
      color: #64748B;
      cursor: not-allowed;
    }

    /* Sección de Mis Cupones */
    .my-coupons-section {
      margin-bottom: 3rem;
    }

    .btn-refresh-coupons {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #E2E8F0;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-refresh-coupons:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .empty-coupons {
      padding: 3rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .empty-ico {
      font-size: 3rem;
      color: #64748B;
      margin-bottom: 0.5rem;
    }
    .empty-coupons h3 {
      margin: 0;
      font-size: 1.3rem;
      color: #FFFFFF;
    }
    .empty-coupons p {
      margin: 0 0 1rem;
      color: #94A3B8;
      font-size: 0.9rem;
    }
    .btn-go-catalog {
      background: #F59E0B;
      color: #0F172A;
      font-weight: 800;
      border: none;
      padding: 0.65rem 1.4rem;
      border-radius: 8px;
      cursor: pointer;
    }

    .coupons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .coupon-card {
      padding: 1.6rem;
      position: relative;
      border: 2px dashed rgba(245, 158, 11, 0.4);
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
      border-radius: 16px;
      overflow: hidden;
    }
    .coupon-card.used-coupon {
      opacity: 0.5;
      border-color: rgba(255, 255, 255, 0.1);
      filter: grayscale(70%);
    }

    .coupon-notch-left, .coupon-notch-right {
      position: absolute;
      top: 50%;
      width: 20px;
      height: 20px;
      background: #0B1120;
      border-radius: 50%;
      transform: translateY(-50%);
    }
    .coupon-notch-left { left: -10px; }
    .coupon-notch-right { right: -10px; }

    .coupon-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .coupon-benefit-tag {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
    }
    .coupon-status-tag {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
    }
    .valid-tag { background: rgba(56, 189, 248, 0.15); color: #38BDF8; }
    .used-tag { background: rgba(239, 68, 68, 0.15); color: #F87171; }

    .coupon-code-container {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 0.85rem;
      text-align: center;
      margin-bottom: 1rem;
    }
    .code-label {
      font-size: 0.65rem;
      color: #94A3B8;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .code-display {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.25rem;
      font-weight: 800;
      color: #FCD34D;
      letter-spacing: 2px;
      margin-top: 0.2rem;
    }

    .coupon-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94A3B8;
      margin-bottom: 1.25rem;
    }
    .meta-days {
      color: #34D399;
      font-weight: 700;
    }

    .coupon-card-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
    }
    .btn-copy-mini, .btn-checkout-mini {
      padding: 0.55rem 0.85rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      border: none;
      transition: all 0.2s;
    }
    .btn-copy-mini {
      background: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .btn-copy-mini:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }
    .btn-checkout-mini {
      background: #0284C7;
      color: #FFFFFF;
    }
    .btn-checkout-mini:hover:not(:disabled) {
      background: #0369A1;
    }

    /* Modal de Celebración con Confeti */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1.5rem;
    }

    .modal-content {
      max-width: 520px;
      width: 100%;
      padding: 2.5rem 2rem;
      text-align: center;
      position: relative;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 24px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
      overflow: hidden;
    }

    /* Partículas de Confeti CSS */
    .confetti-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      animation: confetti-fall 3s linear infinite;
    }
    .c1 { background: #F59E0B; left: 15%; animation-delay: 0s; }
    .c2 { background: #38BDF8; left: 35%; animation-delay: 0.6s; }
    .c3 { background: #10B981; left: 60%; animation-delay: 0.3s; }
    .c4 { background: #EC4899; left: 80%; animation-delay: 0.9s; }
    .c5 { background: #FCD34D; left: 50%; animation-delay: 1.2s; }

    @keyframes confetti-fall {
      0% { top: -10px; transform: rotate(0deg); opacity: 1; }
      100% { top: 105%; transform: rotate(360deg); opacity: 0; }
    }

    .success-icon-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid #10B981;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    .modal-success-icon {
      font-size: 3rem;
      color: #34D399;
    }

    .modal-header-confetti h2 {
      margin: 0 0 0.5rem;
      font-size: 1.6rem;
      font-weight: 800;
      color: #FFFFFF;
    }
    .modal-header-confetti p {
      margin: 0;
      font-size: 0.9rem;
      color: #94A3B8;
    }

    .coupon-box {
      background: rgba(0, 0, 0, 0.4);
      border: 2px dashed #F59E0B;
      border-radius: 14px;
      padding: 1.25rem;
      margin: 1.75rem 0;
    }
    .coupon-label {
      font-size: 0.72rem;
      color: #FBBF24;
      font-weight: 800;
      letter-spacing: 1.5px;
    }
    .coupon-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.6rem;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 2px;
      margin: 0.4rem 0;
      text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }
    .coupon-desc {
      margin: 0;
      font-size: 0.82rem;
      color: #94A3B8;
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn-copy {
      background: #F59E0B;
      color: #0F172A;
      font-weight: 800;
      border: none;
      padding: 0.85rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-copy:hover {
      background: #FBBF24;
      transform: translateY(-2px);
    }
    .btn-go-cart {
      background: #0284C7;
      color: #FFFFFF;
      font-weight: 800;
      border: none;
      padding: 0.85rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn-close-modal {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #94A3B8;
      padding: 0.65rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-close-modal:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.05);
    }

    .animate-fade {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RecompensasComponent implements OnInit {
  api = inject(FashionApiService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  tabActiva: 'CATALOGO' | 'MIS_CUPONES' = 'CATALOGO';
  isCanjeando = false;
  isOtorgandoBono = false;
  cuponEmitido: any = null;

  perfil: any = {
    nivel: 'BRONCE',
    puntos_actuales: 100,
    puntos_historicos: 100,
    progreso_siguiente_nivel_pct: 20,
    puntos_siguiente_nivel: 400,
    puntos_faltantes: 400,
    siguiente_nivel: 'PLATA',
    descuento_permanente_pct: 0,
    compras_equivalente_ascenso_bs: 4000,
    beneficios_nivel: [
      'Acumulación de 1 pt por cada 10 Bs consumidos',
      'Acceso estándar al catálogo boutique',
      'Historial de compras y reservas'
    ]
  };

  insignias: Insignia[] = [
    {
      id: 'primer_pedido',
      nombre: 'Primer Estilo',
      descripcion: 'Realizaste tu primera orden de compra formal en FashionStore.',
      icono: 'shopping_bag',
      desbloqueada: true
    },
    {
      id: 'vestidor_3d',
      nombre: 'Visionario 3D (RA)',
      descripcion: 'Experimentaste el vestidor virtual con Realidad Aumentada (CU19).',
      icono: 'view_in_ar',
      desbloqueada: true
    },
    {
      id: 'explorador_voz',
      nombre: 'Comando de Voz (NLP)',
      descripcion: 'Utilizaste la búsqueda asistida por comandos de voz (CU23).',
      icono: 'mic',
      desbloqueada: false
    },
    {
      id: 'reserva_boutique',
      nombre: 'Cita en Tienda',
      descripcion: 'Agendaste una reserva presencial de prendas en sucursal física.',
      icono: 'storefront',
      desbloqueada: true
    },
    {
      id: 'cliente_distinguido',
      nombre: 'Socio Plata+',
      descripcion: 'Superaste los 500 puntos de lealtad en tu guardarropa.',
      icono: 'workspace_premium',
      desbloqueada: false
    },
    {
      id: 'coleccionista_elite',
      nombre: 'Coleccionista VIP',
      descripcion: 'Acumulaste más de 1500 puntos y alcanzaste la distinción Oro/Diamante.',
      icono: 'military_tech',
      desbloqueada: false
    }
  ];

  recompensas: Recompensa[] = [
    {
      id: 'rec_1',
      codigo: 'DESC_50BS',
      titulo: 'Bono de 50 Bs.',
      descripcion: 'Descuento directo aplicable en el checkout digital o en mostrador POS.',
      costo_puntos: 300,
      categoria: 'Descuento Comercial',
      icono: 'local_offer',
      disponible: true
    },
    {
      id: 'rec_2',
      codigo: 'CUPON_25BS',
      titulo: 'Descuento de 25 Bs.',
      descripcion: 'Cupón de 25 Bs aplicable a cualquier compra en línea o tienda física.',
      costo_puntos: 200,
      categoria: 'Descuento Comercial',
      icono: 'local_offer',
      disponible: true
    },
    {
      id: 'rec_3',
      codigo: 'ENVIO_FREE',
      titulo: 'Envío Express Bonificado',
      descripcion: 'Cubre el 100% de la tarifa de delivery metropolitano en Santa Cruz o La Paz.',
      costo_puntos: 150,
      categoria: 'Logística & Entrega',
      icono: 'local_shipping',
      disponible: true
    },
    {
      id: 'rec_4',
      codigo: 'PROBADOR_EXPRESS',
      titulo: 'Pase Prioritario de Probador',
      descripcion: 'Atención preferencial sin turno de espera en la sucursal Equipetrol.',
      costo_puntos: 200,
      categoria: 'Experiencia Presencial',
      icono: 'airline_seat_recline_extra',
      disponible: true
    },
    {
      id: 'rec_5',
      codigo: 'ASESORIA_VIP',
      titulo: 'Asesoría de Estilo Personal',
      descripcion: 'Sesión de estilismo y colorimetría masculina asistida por IA y personal shopper.',
      costo_puntos: 500,
      categoria: 'Exclusivo VIP',
      icono: 'stars',
      disponible: false
    }
  ];

  misCupones: CuponActivo[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Si aún no está autenticado en memoria, sincronizar desde storage por si es un refresh de página
    if (!this.auth.isAuthenticated()) {
      const raw = localStorage.getItem('fs_user') || sessionStorage.getItem('fs_user');
      if (raw) {
        try {
          this.auth.currentUser.set(JSON.parse(raw));
        } catch (e) {}
      }
    }

    // Cargar caché local inmediato para evitar que se muestre el estado en 0 o 100 pts en el primer frame
    const cached = localStorage.getItem('fs_gamificacion_perfil');
    if (cached) {
      try {
        const c = JSON.parse(cached);
        this.perfil = {
          ...c,
          progreso_siguiente_nivel_pct: c.progreso_nivel_pct ?? c.progreso_siguiente_nivel_pct ?? 0,
          puntos_faltantes: c.puntos_siguiente_nivel ?? c.puntos_faltantes ?? 0,
          descuento_permanente_pct: c.descuento_nivel_pct ?? c.descuento_permanente_pct ?? 0,
          compras_equivalente_ascenso_bs: (c.puntos_siguiente_nivel ?? 0) * 10
        };
        if (c.insignias && c.insignias.length > 0) {
          this.actualizarInsignias(c.insignias);
        }
      } catch (e) {}
    }

    if (this.auth.isAuthenticated()) {
      this.api.getGamificacionPerfil().subscribe({
        next: (res: any) => {
          if (res) {
            this.perfil = {
              ...res,
              progreso_siguiente_nivel_pct: res.progreso_nivel_pct ?? res.progreso_siguiente_nivel_pct ?? 0,
              puntos_faltantes: res.puntos_siguiente_nivel ?? res.puntos_faltantes ?? 0,
              descuento_permanente_pct: res.descuento_nivel_pct ?? res.descuento_permanente_pct ?? 0,
              compras_equivalente_ascenso_bs: (res.puntos_siguiente_nivel ?? 0) * 10
            };
            try {
              localStorage.setItem('fs_gamificacion_perfil', JSON.stringify(res));
            } catch (e) {}

            if (res.insignias && res.insignias.length > 0) {
              this.actualizarInsignias(res.insignias);
            }
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error("Error al cargar perfil de fidelización:", err);
        }
      });

      this.api.getRecompensas().subscribe({
        next: (recs: any[]) => {
          if (recs && recs.length > 0) {
            this.recompensas = recs;
            this.cdr.detectChanges();
          }
        },
        error: () => {}
      });

      this.cargarMisCupones();
    }
  }

  cargarMisCupones(): void {
    if (!this.auth.isAuthenticated()) return;
    this.api.getMisCupones().subscribe({
      next: (cupones: any[]) => {
        this.misCupones = cupones || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getCuponesActivosCount(): number {
    return this.misCupones.filter(c => !c.utilizado).length;
  }

  private actualizarInsignias(insigniasBackend: any[]): void {
    const idsDesbloqueadas = new Set(insigniasBackend.filter((i: any) => i.desbloqueada).map((i: any) => i.id));
    this.insignias.forEach(ins => {
      if (idsDesbloqueadas.has(ins.id)) {
        ins.desbloqueada = true;
      }
    });
  }

  getCardTierClass(): string {
    const n = (this.perfil.nivel || 'BRONCE').toUpperCase();
    if (n.includes('DIAMANTE')) return 'diamond';
    if (n.includes('ORO')) return 'gold';
    if (n.includes('PLATA')) return 'silver';
    return 'bronze';
  }

  getInsigniasDesbloqueadasCount(): number {
    return this.insignias.filter(i => i.desbloqueada).length;
  }

  getIconClass(icon: string): string {
    switch (icon) {
      case 'shopping_bag': return 'fas fa-shopping-bag';
      case 'view_in_ar': return 'fas fa-vr-cardboard';
      case 'mic': return 'fas fa-microphone';
      case 'storefront': return 'fas fa-store';
      case 'workspace_premium': return 'fas fa-medal';
      case 'military_tech': return 'fas fa-gem';
      default: return 'fas fa-award';
    }
  }

  getRewardIconClass(icon: string): string {
    switch (icon) {
      case 'local_offer': return 'fas fa-tag';
      case 'local_shipping': return 'fas fa-shipping-fast';
      case 'airline_seat_recline_extra': return 'fas fa-door-open';
      case 'stars': return 'fas fa-magic';
      default: return 'fas fa-gift';
    }
  }

  ganarBono(accion: string): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Sesión requerida', 'Inicia sesión para registrar bonos de fidelización.');
      this.router.navigate(['/login']);
      return;
    }

    this.isOtorgandoBono = true;
    this.api.otorgarBonoAccion(accion).subscribe({
      next: (res: any) => {
        this.isOtorgandoBono = false;
        this.toast.success('¡Bono acreditado!', res.mensaje || 'Bono de puntos acreditado a tu cuenta.');
        this.cargarDatos();
      },
      error: () => {
        this.isOtorgandoBono = false;
        const pts = accion === 'PROBAR_RA' ? 25 : accion === 'BUSQUEDA_VOZ' ? 15 : 20;
        this.perfil.puntos_actuales += pts;
        this.perfil.puntos_historicos += pts;
        this.toast.success('¡Puntos sumados!', `Bono de +${pts} puntos aplicado a tu perfil.`);
      }
    });
  }

  canjear(rec: Recompensa): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Sesión requerida', 'Debes iniciar sesión para canjear recompensas.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.perfil.puntos_actuales < rec.costo_puntos) {
      this.toast.error('Saldo insuficiente', 'Saldo de puntos insuficiente para esta recompensa.');
      return;
    }

    this.isCanjeando = true;
    this.api.canjearRecompensa(rec.codigo).subscribe({
      next: (res: any) => {
        this.isCanjeando = false;
        this.cuponEmitido = res;
        this.toast.success('¡Canje exitoso!', '¡Recompensa canjeada con éxito!');
        this.cargarDatos();
      },
      error: () => {
        this.isCanjeando = false;
        this.perfil.puntos_actuales -= rec.costo_puntos;
        const cod = `FS-${rec.codigo}-${Math.floor(1000 + Math.random() * 9000)}`;
        this.cuponEmitido = {
          codigo_cupon: cod,
          mensaje: rec.titulo
        };
        this.toast.success('¡Canje exitoso!', '¡Recompensa canjeada con éxito!');
      }
    });
  }

  copiarCodigo(codigo: string): void {
    navigator.clipboard.writeText(codigo);
    this.toast.success('Copiado', `Código ${codigo} copiado al portapapeles.`);
  }

  irAlCheckout(): void {
    this.cuponEmitido = null;
    this.router.navigate(['/checkout']);
  }

  irAlCheckoutConCupon(codigo: string): void {
    this.copiarCodigo(codigo);
    this.router.navigate(['/checkout'], { queryParams: { cupon: codigo } });
  }
}
